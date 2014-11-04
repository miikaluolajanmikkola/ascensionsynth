/**
 * Wavetable algorithms copied from the Internet.
 * Collection is a application wide Object container with helper functions
 */

// This was for Riffwave 
var convert255 = false;

var Collection = function(){

  this.count = 0;
  this.collection = {};
  this.keyList = [];

  this.add = function(key, item) {
    if ( this.collection[key] != undefined)
      return undefined;
    this.collection[key] = item;
    this.keyList.push(key);
    return ++this.count
  }

  this.remove = function(key) {
    if ( this.collection[key] == undefined)
      return undefined;
    delete this.collection[key]
    return --this.count
  }

  this.item = function(key) {
    return this.collection[key];
  }

  this.list = function() {
    return this.keyList;
  }

}

var wfColl = new Collection(); // Wave Function Collection

wfColl.add('Sinewave', 'sinewave');
wfColl.add('Violin', 'violin');
wfColl.add('Droplet', 'waterdrop');
wfColl.add('Techno', 'fm1');
wfColl.add('Techno 2', 'fm2');
//wfColl.add('Supersine', 'supersine');
wfColl.add('Sacred Harpsicord', 'harpsicord');
//wfColl.add('Clarinet', 'clarinet');
//wfColl.add('Laser1', 'laserstatic1');
//wfColl.add('Laser2', 'laserecho');
wfColl.add('Whitenoise', 'whitenoise');
//wfColl.add('Wsin', 'wikisin');
/*
waveCollection.add('Wsquare', 'wikisquare');
waveCollection.add('Wsaw', 'wikisaw');
waveCollection.add('Wtri', 'wikitri');
*/

function getWaveCollection() {
  return wfColl;
}

/**
 * These callbacks have variety in given parameters. Refactor, wrap these functions properly.
 * @type {Collection}
 */
var nodeAudioCallback = new Collection(); // 

nodeAudioCallback.add('fmod', fmod); // x,y 
nodeAudioCallback.add('sign', sign); // x
nodeAudioCallback.add('smoothstep', smoothstep); // a, b, x
nodeAudioCallback.add('clamp', clamp); // x, a, b
nodeAudioCallback.add('step', step); // a, x
nodeAudioCallback.add('mix', mix); // a, b, x
nodeAudioCallback.add('over', over); // x, y
nodeAudioCallback.add('tri', tri); // a, x
nodeAudioCallback.add('saw', saw); // x, a
nodeAudioCallback.add('sq', sqr); // a, x
nodeAudioCallback.add('grad', grad); // n, x
nodeAudioCallback.add('noise', noise); // x
nodeAudioCallback.add('cellnoise', cellnoise); // x
nodeAudioCallback.add('frac', frac); // x

function getNodeAudioCallbackCollection() {

    return nodeAudioCallback;
}



//Input: Peak amplitude (A), Frequency (f)
//Output: Amplitude value (y)
var wikisin = function wikisin(f) {

  var samples = [];
  var phase;
  for (i = 0; i < sampleRate; i++) {

    phase = i / sampleRate;
    //y = A * sin(phase)
    phase = phase + ((2 * pi * f) / phase);
    if (phase > (2 * pi)) {
      phase = phase - (2 * pi);
    }
    samples[i] = phase;

    //Do wee need this after last operation: (?)
    if (samples[i] > 1)
      samples[i] = 1;
    else if (samples[i] < -1)
      samples[i] = -1;
  }
  return samples;
}

/*
function wikisquare(f) {

  var samples = [];
  var phase;
  for (i = 0; i < sampleRate; i++) {
    
    if (phase < pi)
        y = A;
    else
        y = -A;
    phase = phase + ((2 * pi * f) / samplerate);
    if (phase > (2 * pi))
      phase = phase - (2 * pi);
  }

  return samples;
}

function wikisaw(f) {

  var samples = [];
  for (i = 0; i < sampleRate; i++) {  
    y = A - (A / pi * phase);
    phase = phase + ((2 * pi * f) / samplerate);
    if (phase > (2 * pi))
      phase = phase - (2 * pi);

    
  }

  return samples;
}

function wikitri(f) {

  var samples = [];
  if (phase < pi)
    y = -A + (2 * A / pi) * phase;
  else
    y = A*3 - (2 * A / pi) * phase;
  phase = phase + ((2 * pi * f) / samplerate);
  if (phase > (2 * pi))
    phase = phase - (2 * pi);

  return samples;
}
*/

//These are pathetic
//var attackEnd = 4800; // 5ms in 96000kHz
//var attackEnd = 9600; // 10ms in 96000kHz
var attackEnd = 192000 / 96000; // 20ms in 96000kHz
var releaseStart = 96000 - 9600;
var targetRatio = 0.5;

var arRate = function(t, targetRatio) {

  return exp(-log((1 + targetRatio) / targetRatio) / t);
}



var singlesine = function singlesine(f) {
  // not single onprocess-compatible now
  var a = [];
  for (var i=0; i < kBufferLength ; i++) {
    var t = i / kBufferLength; // time from 0 to 1

    a[i] = sin( f * 2 * PI * t); // wave equation (between -1,+1)  
    /*if (i > (2 * pi)) {
      a = t - (2 * pi);
    }*/

    //if (a[i] > 1) a[i] = 1;
    //else if (a[i] < -1) a[i] = -1;

    //if (convert255 == true)
     // a = 128 + Math.round( 127 * a);
  }
  return a;
}

var sinewave = function sinewave(f) {
  
  var samples = [];
  for (var i=0; i < sampleRate ; i++) {
    var t = i/sampleRate; // time from 0 to 1
    samples[i] = sin( f * 2 * PI * t ); // wave equation (between -1,+1)  
    
    //if (i < attackEnd) samples[i] -= arRate(t, targetRatio);
    //if (i > releaseStart) samples[i] -= arRate(t, targetRatio);
    
    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var harpsicord = function bass(f) {

  var samples = [];
  for (var i=0; i < sampleRate; i++) {
    var t = i/sampleRate;
    samples[i] = pow(sin( 1.26*f/2 * 2*PI*t ),15)*pow((1-t),3) * pow(sin( 1.26*f/10 * 2*PI*t ),3)*10;

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true) 
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var violin = function violin(f) {

  var samples = [];
  for (var i=0; i < sampleRate; i++) {
    var t = i / sampleRate;
    var y = 0;
    var A_total = 0;
    for (var harm=1;harm<=7;harm++) {
      var f2 = f * harm;
      var A = 1 / harm;
      A_total += A;
      y += A * sin(f2 * 2 * PI * t);
    }
    samples[i] = y / A_total;
    //samples[i] *= (1 - 0.5 * sin(2 * PI * 6 * t)); // Add a low frequency amplitude modulation
    samples[i] *= (1 - exp(-t * 3));

    //if (samples[i] > 1) samples[i] = 1;
    //else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true) samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

/* This is for ScriptProcessorNode */
function discreetViolin(i, freq) {

  var samples = [];
  for (var i=0; i < sampleRate ; i++) {
    var t = i/sampleRate;
    var y=0;
    var A_total = 0;
    for (var harm=1;harm<=7;harm++) {
      var f2 = f*harm;
      var A = 1/harm;
      A_total += A;
      y += A*sin(f2*2*PI*t);
    }
    samples[i] = y/A_total;
    samples[i] *= (1-0.5*sin(2*PI*6*t)); // Add a low frequency amplitude modulation
    samples[i] *= (1-exp(-t*3));

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true) samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var waterdrop = function waterdrop(f1) { 

  //var f1 = 900;
  var f2 = 20;
  var samples = [];
  for (var i=0; i < sampleRate ; i++) {
    var t = i/sampleRate;
    samples[i] = 1*cos(2*PI*f1*(t) + 20*cos(2*PI*f2*(t)) );
    samples[i] *= exp(-t*15);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var fm1 = function fm1(f) {

  var samples = [];
  for (var i=0; i < sampleRate ; i++) {
    var t = i/sampleRate;
    var w = 2*PI*f*t;
    samples[i] = cos(w + 8*sin(w*7/5) * exp(-t*4) );
    samples[i] *= exp(-t*3);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var fm2 = function fm2(f) {

  var samples = [];
  for (var i=0; i < sampleRate ; i++) {
    var t = i/sampleRate;
    var w = 2*PI*f*t;
    samples[i] = cos(w + 8*sin(w*2) * exp(-t*4) );
    samples[i] *= exp(-t*3);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true) 
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var clarinet = function clarinet(f) {

  var samples = [];
  for (var i=0; i < sampleRate ; i++) {
    var t = i/sampleRate;
    var w = f*2*PI*t;
  // Odd harmonics
    samples[i] = (sin(w) + 0.75*sin(w*3) + 0.5*sin(w*5)+0.14*sin(w*7)+0.5*sin(w*9)+0.12*sin(11*w)+0.17*sin(w*13))/(1+.75+.5+.14+.17);
    samples[i] *= exp(t/1.5);
    samples[i] *= exp(-t*1.5);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var laserecho = function laserecho(f1) {

  var f2 = 5;
  var samples = [];
  for (var i = 0; i < sampleRate ; i++) {
    var t = i/sampleRate;
    samples[i] = cos(2*PI*f1*t + 1500*cos(2*PI*f2*t) );
    samples[i] *= exp(-t*4);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var laserstatic1 = function laserstatic1(f) {

  var samples = [];
  for (var i = 0; i < sampleRate; i++) {
    var t = i/sampleRate;
    samples[i] = sin(pow(5*2*PI*(1-t),3.6) );

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var whitenoise = function whitenoise(f) {

  var samples = [];
  for (var i = 0; i < sampleRate; i++) {
    samples[i] = random()*2-1;

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true) samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}


/* * ** *** *****  MODIFIER FUNCTIONS  ***** *** ** * * */

var fmod = function fmod(x,y) {
    return x%y;
}

var sign = function sign(x) {
    if( x>0.0 ) x=1.0; else x=-1.0;
    return x;
}

var smoothstep = function smoothstep(a,b,x) {
    if( x<a ) return 0.0;
    if( x>b ) return 1.0;
    var y = (x-a)/(b-a);
    return y*y*(3.0-2.0*y);
}

function clamp(x,a,b) {
    if( x<a ) return a;
    if( x>b ) return b;
    return x;
}

function step(a,x) {
    if( x<a ) return 0.0;
    else      return 1.0;
}

function mix(a,b,x) {
    return a + (b-a)*Math.min(Math.max(x,0.0),1.0);
}

function over(x,y) {
    return 1.0 - (1.0-x)*(1.0-y);
}

function tri(a,x) {
    x = x / (2.0*Math.PI);
    x = x % 1.0;
    if( x<0.0 ) x = 1.0+x;
    if(x<a) x=x/a; else x=1.0-(x-a)/(1.0-a);
    return -1.0+2.0*x;
}

function saw(x,a) {
    var f = x % 1.0;

    if( f<a )
        f = f/a;
    else
        f = 1.0 - (f-a)/(1.0-a);
    return f;
}

function sqr(a,x) {
    if( Math.sin(x)>a ) x=1.0; else x=-1.0;
    return x;
}

function grad(n, x) {
    n = (n << 13) ^ n;
    n = (n * (n * n * 15731 + 789221) + 1376312589);
    var res = x;
    if( n & 0x20000000 ) res = -x;
    return res;
}

function noise(x) {
    var i = Math.floor(x);
    var f = x - i;
    var w = f*f*f*(f*(f*6.0-15.0)+10.0);
    var a = grad( i+0, f+0.0 );
    var b = grad( i+1, f-1.0 );
    return a + (b-a)*w;
}

function cellnoise(x) {
    var n = Math.floor(x);
    n = (n << 13) ^ n;
    n = (n * (n * n * 15731 + 789221) + 1376312589);
    n = (n>>14) & 65535;
    return n/65535.0;
}

function frac(x) {
//    return x - Math.floor(x);
    return x % 1.0;
}
