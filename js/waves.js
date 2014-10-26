/**
 * Wavetable algorithms copied from the Internet.
 *
 * Implemented in Ascension Synthesizer by Miika Luolajan-Mikkola
 */


var wfColl = new Collection(); // Stands for Wave Function Collection {Collection}.count, .headers, .list, .item
wfColl.add('Sinewave', 'sinewave');
//wfColl.add('Supersine', 'supersine');
wfColl.add('Harpsicord', 'harpsicord');
wfColl.add('FM1', 'bell1');
wfColl.add('FM2', 'bell2');
wfColl.add('Waterdrop', 'waterdrop');
wfColl.add('Violin', 'violin');
wfColl.add('Clarinet', 'clarinet');
wfColl.add('Laser1', 'laserstatic1');
wfColl.add('Laser2', 'laserecho');
wfColl.add('Whitenoise', 'whitenoise');
wfColl.add('Wsin', 'wikisin');
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
var nodeAudioCallback = new Collection();
nodeAudioCallback.add('fmod', fmod);
nodeAudioCallback.add('sign', sign);
nodeAudioCallback.add('smoothstep', smoothstep);
nodeAudioCallback.add('clamp', clamp);
nodeAudioCallback.add('step', step);
nodeAudioCallback.add('mix', mix);
nodeAudioCallback.add('over', over);
nodeAudioCallback.add('tri', tri);
nodeAudioCallback.add('saw', saw);
nodeAudioCallback.add('sq', sqr);
nodeAudioCallback.add('grad', grad);
nodeAudioCallback.add('noise', noise);
nodeAudioCallback.add('cellnoise', cellnoise);
nodeAudioCallback.add('frac', frac);

function getNodeAudioCallbackCollection() {

    return nodeAudioCallback;
}

var convert255 = false;

//Input: Peak amplitude (A), Frequency (f)
//Output: Amplitude value (y)
var wikisin = function wikisin(f, samples_length) {

  var samples = [];
  var phase;
  for (i = 0; i < samples_length; i++) {
    phase = i / samples_length;
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
//SQUARE
function wikisquare(f, samples_length) {

  var samples = [];
  var phase;
  for (i = 0; i < samples_length; i++) {
    
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

//SAW
function wikisaw(f, samples_length) {

  var samples = [];
  for (i = 0; i < samples_length; i++) {  
    y = A - (A / pi * phase);
    phase = phase + ((2 * pi * f) / samplerate);
    if (phase > (2 * pi))
      phase = phase - (2 * pi);

    
  }

  return samples;
}

//TRI
function wikitri(f, samples_length) {

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
//var attackEnd = 4800; // 5ms in 96000kHz
//var attackEnd = 9600; // 10ms in 96000kHz
var attackEnd = 192000 / 96000; // 20ms in 96000kHz
var releaseStart = 96000 - 9600;
var targetRatio = 0.5;

var arRate = function(t, targetRatio) {

  return exp(-log((1 + targetRatio) / targetRatio) / t);
}

// Equal temperament ratio = 2^(i/12)

var supersine = function supersine(f, samples_length) {

  var samples = [];
  for (var i=0; i < samples_length ; i++) { // fills array with samples
    var t = i/samples_length;               // time from 0 to 1
    samples[i] = sin( f * 2*PI*t ); // wave equation (between -1,+1)

    samples[i] *= 2 * phi;

    if (samples[i] > 1)
        samples[i] = 1;
      else if (samples[i] < -1)
        samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}


var sinewave = function sinewave(f, samples_length) {
  
  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i / samples_length; // time from 0 to 1
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

var harpsicord = function bass(f, samples_length) {

  var samples = [];
  for (var i=0; i < samples_length; i++) {
    var t = i/samples_length;
    samples[i] = pow(sin( 1.26*f/2 * 2*PI*t ),15)*pow((1-t),3) * pow(sin( 1.26*f/10 * 2*PI*t ),3)*10;

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true) 
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var violin = function violin(f, samples_length) {

  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i/samples_length;
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

/* This is for ScriptProcessorNode */
function discreetViolin(i, freq) {

  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i/samples_length;
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

var waterdrop = function waterdrop(f1, samples_length) { 

  //var f1 = 900;
  var f2 = 20;
  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i/samples_length;
    samples[i] = 1*cos(2*PI*f1*(t) + 20*cos(2*PI*f2*(t)) );
    samples[i] *= exp(-t*15);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var bell1 = function bell1(f, samples_length) {

  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i/samples_length;
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

var bell2 = function bell2(f, samples_length) {

  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i/samples_length;
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

var clarinet = function clarinet(f, samples_length) {

  var samples = [];
  for (var i=0; i < samples_length ; i++) {
    var t = i/samples_length;
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

var laserecho = function laserecho(f1, samples_length) {

  var f2 = 5;
  var samples = [];
  for (var i = 0; i < samples_length ; i++) {
    var t = i/samples_length;
    samples[i] = cos(2*PI*f1*t + 1500*cos(2*PI*f2*t) );
    samples[i] *= exp(-t*4);

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var laserstatic1 = function laserstatic1(f, samples_length) {

  var samples = [];
  for (var i = 0; i < samples_length; i++) {
    var t = i/samples_length;
    samples[i] = sin(pow(5*2*PI*(1-t),3.6) );

    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var whitenoise = function whitenoise(f, samples_length) {

  var samples = [];
  for (var i = 0; i < samples_length; i++) {
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
