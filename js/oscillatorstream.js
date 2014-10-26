//Oscillator Streaming

//Web Audio Context
//https://developer.mozilla.org/en-US/docs/Web/API/AudioContext.createBufferSource



var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
if( audioCtx == null ) alert('Your browser does not support Web Audio Api. Performance will be crap now, sorry');
var channels = 2;
// Create an empty two second stereo buffer at the
// sample rate of the AudioContext
var frameCount    = audioCtx.sampleRate * 2.0;
var myArrayBuffer = audioCtx.createBuffer(2, frameCount, audioCtx.sampleRate);


function bufferWaveStream(samples) {
    
    //NOTE: This seems to not implement the Web Audio ScriptProcessorNode, which should be tested too.
    console.log(samples);
    for (var channel = 0; channel < channels; channel++) {
        
        // This gives us the actual ArrayBuffer that contains the data
        //var nowBuffering = myArrayBuffer.getChannelData(channel);
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < frameCount; i++) {
            //nowBuffering[i] = bufferRuntimeCallback('fmod');
            //nowBuffering[i] = sin( 2*PI*i );
            nowBuffering[i] = samples[i];
        }
    }
    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    var source = audioCtx.createBufferSource();
    // set the buffer in the AudioBufferSourceNode
    source.buffer = myArrayBuffer;
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);

    /* TODO: Hack gain properties from this progress and insert here upon
    var gaynode = audioCtx.createGain();
    gaynode.connect(audioCtx.destination);
    gaynode.gain.value = 0.5 * this.mVolume/100.0;
    
    var node = audioCtx.createBufferSource();
    node.buffer = this.mBuffer[id];
    //node.gain.value = 0.5 * this.mVolume/100.0;
    //node.connect(audioCtx.destination);
    node.connect(gainNode);
    //node.noteOn(0);
    node.state = node.noteOn;
    node.start(0);
    */
    // start the source playing
    source.start();
}



