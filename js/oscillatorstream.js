//Oscillator Streaming with algorithms from waves.js

//https://developer.mozilla.org/en-US/docs/Web/API/AudioContext.createBufferSource

/* Defined in ScriptProcessorNode.js
var AC = new (window.AudioContext || window.webkitAudioContext)();
if( AC == null ) alert('Your browser does not support Web Audio Api.');
var channels = 1;
var frameCount    = 8192; //AC.sampleRate;
var acBuffer = AC.createBuffer(channels, frameCount, AC.sampleRate);
/**/

function bufferWaveStream(samples) {
    
    //NOTE: This seems to not implement the Web Audio ScriptProcessorNode?
    //console.log(samples);
    for (var channel = 0; channel < channels; channel++) {
        
        //var nowBuffering = acBuffer.getChannelData(channel);
        var nowBuffering = acBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++) {
            //nowBuffering[i] = bufferRuntimeCallback('fmod');
            //nowBuffering[i] = sin( 2*PI*i );
            nowBuffering[i] = samples[i];
        }
    }

    //var delay = new FX_Delay(AC);

    var gaynode = AC.createGain();
    
    // Get an AudioBufferSourceNode. This is the AudioNode to use when we want to play an AudioBuffer
    var source = AC.createBufferSource();

    //gaynode.connect(source);
    
    // set the buffer in the AudioBufferSourceNode
    source.buffer = acBuffer;
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(AC.destination);

    gaynode.gain.value = 10;

    // start the source playing
    source.start();
    
    return;
}



