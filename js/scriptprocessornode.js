//http://sriku.org/blog/2013/01/30/taming-the-scriptprocessornode/

var AC = new ( window.AudioContext || window.webkitAudioContext)();
var scriptNodes = {};

function chime_jsosc(t, freq, output, samples) {

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
}

function synthEngineStream(t, freq, output, samples) {

    freq = freq || 528.0;
    t = Math.max(t || 0.0, AC.currentTime);
    output = output || AC.destination;
    var stopTime = t + 10.0;

    var osc = AC.createOscillator();
    
    osc.frequency.value = freq;

    var gain = scriptWithStartStopTime(osc, output, t, stopTime, (function () {
        var amplitude = 0.25;
        var decay = Math.exp(- 1.0 / (2.0 * AC.sampleRate));
        return function (event, fromSamp, toSamp) {
            var i, inp, out;
            inp = event.inputBuffer.getChannelData(0);
            out = event.outputBuffer.getChannelData(0);
            for (i = fromSamp; i < toSamp; ++i, amplitude *= decay) {
                out[i] = amplitude * inp[i];
            }
        };
    }()));

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
    var prepareAheadTime = 0.01; // seconds

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
    if (dt < 0.001 + prepareAheadTime) {
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



