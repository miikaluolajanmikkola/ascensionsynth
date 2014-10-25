/**
 * Wavetable algorithms copied from the Internet.
 *
 * Implemented in Ascension Synthesizer by Miika Luolajan-Mikkola
 */


var wfColl = new Collection(); // Stands for Wave Function Collection {Collection}.count, .headers, .list, .item

wfColl.add('Sinewave', 'sinewave');
wfColl.add('Supersine', 'supersine');
wfColl.add('Harpsicord', 'bass');
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

var convert255 = true;

//Input: Peak amplitude (A), Frequency (f)
//Output: Amplitude value (y)
var wikisin = function wikisin(f, samples_length) {

  var samples = [];
  var phase;
  for (i = 0; i < samples_length; i++) {
    phase = i/samples_length;
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
var attackEnd = 19200 / 96000; // 20ms in 96000kHz
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
    var t = i/samples_length; // time from 0 to 1
    samples[i] = sin( f*2*PI*t ); // wave equation (between -1,+1)  
    
    if (i < attackEnd) samples[i] += arRate(t, targetRatio);
    if (i > releaseStart) samples[i] += arRate(t, targetRatio);
    
    if (samples[i] > 1) samples[i] = 1;
    else if (samples[i] < -1) samples[i] = -1;

    if (convert255 == true)
      samples[i] = 128 + Math.round( 127 * samples[i]);
  }
  return samples;
}

var bass = function bass(f, samples_length) {

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



