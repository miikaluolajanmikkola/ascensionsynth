//Oscillator Streaming with algorithms from waves.js

/* Defined in ScriptProcessorNode.js
var AC = new (window.AudioContext || window.webkitAudioContext)();
if( AC == null ) alert('Your browser does not support Web Audio Api.');
var channels = 1;
var frameCount    = 8192; //AC.sampleRate;
var asBuffer = AC.createBuffer(channels, frameCount, AC.sampleRate);
/**/

/*
function bufferWaveStream(samples) {
    
    //console.log(samples);
    for (var channel = 0; channel < asBufferChannels; channel++) {
        
        //var nowBuffering = asBuffer.getChannelData(channel);
        var nowBuffering = asBuffer.getChannelData(channel);

        for (var i = 0; i < sampleRate; i++) {
            //nowBuffering[i] = bufferRuntimeCallback('fmod');
            //nowBuffering[i] = sin( 2*PI*i );
            nowBuffering[i] = samples[i];
        }
    }

    var gain = AC.createGain();
    gain.gain.value = 0.5;

    var source = AC.createBufferSource();
    source.buffer = asBuffer;

    source.connect(gain);
    gain.connect(AC.destination);

    source.start();

}
/**/


