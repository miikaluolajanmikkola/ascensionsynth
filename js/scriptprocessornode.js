
/**
 * Initialize Web Audio
 */

/**
 * http://sriku.org/blog/2013/01/30/taming-the-scriptprocessornode/
 * 
Permit creation of script nodes without inputs. This better models source nodes. 
Passing 0 for “number of input channels” may be enough at the API level.

Add dynamic lifetime support similar to native nodes, whereby unreferenced “signal processor” 
script nodes driven by source nodes are automatically released once the source node finishes, 
even if the source node is itself a script node. To achieve this, the time at which the inputs 
cease must be available as part of the event structure passed to the onaudioprocess callback, 
so that the callback can begin any tail phase that it needs to complete before it commits suicide.

Specify a convention and/or API to support tail times beyond the time indicated in a stop(t) call or 
after its inputs have been end-of-lifed.

*/

/**
 * Example of different Web Audio API nodes.
 * @type {[type]}
 *
var pan        = AC.createPanner();
var analyser   = audioCtx.createAnalyser();
var distortion = audioCtx.createWaveShaper();
var gainNode   = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver  = audioCtx.createConvolver();
  
pan.setPosition(10, 5, 0);

// Connect the nodes together
source = audioCtx.createMediaStreamSource(stream);
source.connect(analyser);
analyser.connect(distortion);
distortion.connect(biquadFilter);
biquadFilter.connect(convolver);
convolver.connect(gainNode);
gainNode.connect(audioCtx.destination);

/**/

// I think that AudioContext could be a Singleton maybe? Write to one single node from multiple streams.
// Also the WAA Oscillator created here does not specify the type, wave is algorithmically created by AC.currentTime

var AC = new ( window.AudioContext || window.webkitAudioContext)();
var scriptNodes = {};

var sampleRate = 44100;
var samples_length = sampleRate; // divide by 2 ???
var samples = []; //new Float32Array(samples_length);

// Remember, BiquadFilter takes mono input. 
var channels = 1;
// Create an empty two second stereo buffer at the sample rate of the AudioContext
// frameCount and asBuffer are not handled in this file, go to oscillatorstream.js.

var asBufferSize = [256, 512, 1024, 2048, 4096, 8192, 16384];
var kBufferLength = asBufferSize[4];

//var ACBufferSize = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4];
//var frameCount    = sampleRate * asBufferSize[3];
var asBuffer = AC.createBuffer(channels, sampleRate, AC.sampleRate);

// AS UI Variables, these must be wrapped.
// EG
var asAmplitude = 0.1;

var asAttack = 0.5;
var asDecay = 0.8; // Only decay works, sounds more like a release to me.
var asSustain = 0.6;
var asRelease = 0.2;

var egStoptime = 10; // Script running time

var oscTypes = ['sine', 'triangle', 'sawtooth', 'square', 'custom'];

var asOscType = oscTypes[0]; // Make multiple instances :)
var asOscGain = 0.5;
var asDetune = 0;

var filterTypes = ['lowpass', 'highpass', 'bandpass', 'peaking', 'notch', 'lowshelf', 'highshelf', 'allpass'];

var asFilterType = filterTypes[1]; // Make multiple instances
var asFilterCutoff = 100;
var asFilterResonance = 10;
var asFilterGain = 25;


function fastSine(f, it) {
    //var i = AC.currentTime;
    //var A = asAmplitude;
    //var y; // What's the meaning of y? It's not used anywhere in the process
    //y = A * sin(phase)
    i = it + ((2 * pi * f) / it);
    if (i > (2 * pi)) {
      i = i - (2 * pi);
    }
    return i;
}

function bufferOscStream(init, freq, output, eg) {
    
    init = Math.max(init || 0.0, AC.currentTime);
    freq = freq || 528.0;
    output = output || AC.destination;
    
    /**
     * These should be abstracted
     */
    egStoptime = init + 4; // Script stoptime, don't confuse with EG
    
    var osc = AC.createOscillator();
    osc.frequency.value = freq;
    osc.type            = asOscType;
    osc.detune.value    = asDetune;
    //osc.setPeriodicWave(PeriodicWave periodicWave); // Read: create/setPeriodicWave()
    //osc attribute EventHandler
    
    var gain = AC.createGain();
    gain.gain.value = asOscGain || 0.5;
    
    var filter  = AC.createBiquadFilter();
    filter.type = asFilterType;
    filter.detune = asDetune;

    var SPN = EnvelopeHandler(osc, output, init, egStoptime, (function () {
        
        var amplitude = asAmplitude;

        //var attack = Math.exp(1.6180 / (asAttack * AC.sampleRate)); 
        var decay = Math.exp(- 1.6180 / (asDecay * AC.sampleRate));
        var sustain = 0.5;
        //var release = 0.1;
        //console.log(decay); // Try to find the meaning of decay's float values
        
        return function (event, fromSamp, toSamp) {

            var i, inp, out;
            
            inp = event.inputBuffer.getChannelData(0); // This gets the oscillator wave
            out = event.outputBuffer.getChannelData(0);

            /*for (i=0; i < out.length; i++) {
                inp[i] =  amplitude * noise( inp[i]);
            }*/

            // Decay
            for (i = fromSamp; i < toSamp; ++i, amplitude *= decay) {
                
                out[i] = amplitude * inp[i];            
                //out[i] =  amplitude * noise( inp[i]);       
            }

            
        };
    }()));
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(SPN);
    ////gain.connect(SPN);
    //SPN.connect(output);

    osc.start(init);
    osc.stop(egStoptime);
    /**/

    /*
    var source = AC.createBufferSource();
    source.buffer = asBuffer;
    /**/

    //original gain.connect(output || AC.destination);
    //osc.start(init);
    //osc.stop(egStoptime);
    // osc.onended is callable too
    
    //filter.frequency.value  = asFilterCutoff || 528; //Hz
    filter.frequency.value  = Math.pow(2.0, (freq + 30) / 10);
    filter.Q.value          = asFilterResonance || 13; // Param range unknown
    filter.gain.value       = asFilterGain || 1;
    //console.log(asFilterGain);

}

var keep = (function () {
    var nextNodeID = 1;
    return function (node) {
        node.id = node.id || (nextNodeID++);
        scriptNodes[node.id] = node;
        return node;
    };
}());

function drop(node) {
    delete scriptNodes[node.id];
    return node;
}

function EnvelopeHandler(input, output, init, egStoptime, handler) {

    t = Math.max( init, AC.currentTime);

    egStoptime = Math.max(egStoptime, AC.currentTime);
    console.assert(egStoptime >= t);

    //var kBufferLength = 4096; // samples
    var prepareAheadTime = 0.1; // seconds

    var init_samples = Math.floor(AC.sampleRate * t);
    var egStoptime_samples  = Math.ceil(AC.sampleRate * egStoptime);

    var aeg_a_end;

    var finished = false;

    function onaudioprocess(event) {
        if (finished) { return; }

        // Get realtime, AC.currentTime is 1 / sampleRate
        var t = Math.floor(AC.currentTime * AC.sampleRate);
        var fromSamp = Math.max(0, init_samples - t);

        if (fromSamp >= event.outputBuffer.length) {
            return; // Not started yet.
        }

        var toSamp = Math.min(event.outputBuffer.length, egStoptime_samples - t);

        // Return value of handler is used to decide when to stop. The handler is
        // required to produce as many samples as possible. If it still can't fill
        // up the buffer, it is deemed to have finished.
        var samplesProduced = handler(event, fromSamp, toSamp);

        if (fromSamp + samplesProduced < event.outputBuffer.length) {
            finished = true;
            setTimeout(function () {
                drop(event.node);
                input && input.disconnect();
                event.node.disconnect();
            }, 0);
        }
    }

    // start time is samplerate
    var dt = t - AC.currentTime;

    if (dt < 0.00 + prepareAheadTime) {
        
        var node = keep(AC.createScriptProcessor(kBufferLength, channels, channels));
        node.onaudioprocess = onaudioprocess;

        // Setup the necessary connections.
        input && input.connect(node);
        output && node.connect(output);
        /**/
    } 
    else {
        // Delay the same above
        setTimeout(function(){
            console.log('out of future');
            var node = keep(AC.createScriptProcessor(kBufferLength, channels, channels));
            node.onaudioprocess = onaudioprocess;

            // Setup the necessary connections.
            input && input.connect(node);
            output && node.connect(output);
            
        }, Math.floor(1000 * (dt - prepareAheadTime)));
    }

    return node;
}

/**
 * Needs refactoring, might include a secret key to get the function above working
 * 
 * @param  {[type]} t       [description]
 * @param  {[type]} freq    [description]
 * @param  {[type]} output  [description]
 * @param  {[type]} samples [description]
 * @return {[type]}         [description]
 */
/*
function synthOsc(t, freq, output, samples) {

    freq = freq || 528.0;
    t = Math.max(t || 0.0, AC.currentTime);
    var stopTime = t + 10.0;

    var gain = AC.createGain();
    gain.gain.value = 0.0;
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.setTargetAtTime(0.0, t, 2.0);
    gain.connect(output || AC.destination);

    var osc = scriptWithStartStopTime(null, gain, t, stopTime, (function () {

        var phi = 0; 
        var dphi = 2.0 * Math.PI * freq / AC.sampleRate;        
        //var dphi = violin( freq, AC.sampleRate);
        
        return function (event, fromSamp, toSamp) {
            var i, out;
            out = event.outputBuffer.getChannelData(0);
            for (i = fromSamp; i < toSamp; ++i, phi += dphi[i]) {
                out[i] = Math.sin(phi);
            }
        };
    }()));

    osc.start(t);
    osc.stop(t+10);

}
/**/

