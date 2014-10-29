//http://sriku.org/blog/2013/01/30/taming-the-scriptprocessornode/

/**
 * Examples of different Web Audio API nodes.
 * @type {[type]}
 *
var pan        = AC.createPanner();
var analyser   = audioCtx.createAnalyser();
var distortion = audioCtx.createWaveShaper();
var gainNode   = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver  = audioCtx.createConvolver();

lowpass.type = 'lowpass';
lowpass.frequency.value = 1;
lowpass.Q.value = 1;
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

var AC = new ( window.AudioContext || window.webkitAudioContext)();
var scriptNodes = {};

var acAttack = 1;
var acDecay = 0.1; // Only decay works, sounds more like a release to me.
var acRelease = 5;


/**
 * Needs refactoring
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
function bufferOscStream(t, freq, output, samples) {

    freq = freq || 528.0;
    t = Math.max(t || 2, AC.currentTime);
    output = output || AC.destination;
    var stopTime = t + acRelease;

    var osc      = AC.createOscillator();

    var gain = AC.createGain();
    gain.gain.value = 0.0;
    //gain.gain.setValueAtTime(0.25, t);
    //gain.gain.setTargetAtTime(0.0, t, 2.0);
    

    osc.frequency.value = freq;
    
    var gain = scriptWithStartStopTime(osc, output, t, stopTime, (function () {

        var amplitude = 0.4;

        var decay = Math.exp(- 1.0 / (acDecay * AC.sampleRate));
        
        return function (event, fromSamp, toSamp) {
            var i, inp, out;
            inp = event.inputBuffer.getChannelData(0);
            out = event.outputBuffer.getChannelData(0);
            for (i = fromSamp; i < toSamp; ++i, amplitude *= decay) {
                //@todo: Let's call some coloring functions from waves.js here
                out[i] = amplitude * inp[i];

            }
        };
    }()));

    gain.connect(output || AC.destination);

    osc.start(t);
    osc.stop(stopTime);
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

function scriptWithStartStopTime(input, output, startTime, stopTime, handler) {
    startTime = Math.max(startTime, AC.currentTime);
    stopTime = Math.max(stopTime, AC.currentTime);
    console.assert(stopTime >= startTime);

    var kBufferLength = 512; // samples
    var prepareAheadTime = 0.1; // seconds

    var startTime_samples = Math.floor(AC.sampleRate * startTime);
    var stopTime_samples = Math.ceil(AC.sampleRate * stopTime);
    var finished = false;

    function onaudioprocess(event) {
        if (finished) { return; }

        var t = Math.floor(AC.currentTime * AC.sampleRate);
        var fromSamp = Math.max(0, startTime_samples - t);

        if (fromSamp >= event.outputBuffer.length) {
            return; // Not started yet.
        }

        var toSamp = Math.min(event.outputBuffer.length, stopTime_samples - t);

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

    var dt = startTime - AC.currentTime;
    if (dt < 0.01 + prepareAheadTime) {
        var node = keep(AC.createScriptProcessor(kBufferLength, 1, 1));
        node.onaudioprocess = onaudioprocess;

        // Setup the necessary connections.
        input && input.connect(node);
        output && node.connect(output);
    } else {
        setTimeout(prepareNode, Math.floor(1000 * (dt - prepareAheadTime)));
    }

    return node;
}



