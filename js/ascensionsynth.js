/**
 * Ascension Synthesizer
 * 3D Matrix Wavetable Designer / Microtonal Composer Concept
 * Version 0.5
 * 
 * Inspiration from:
 * 
 * Miika Kuisma / miikakuisma.com
 * Sakari Lehtonen / geokone.net
 * Tim Wessman / lossidesign.fi
 *
 * Written by Miika Luolajan-Mikkola, 2014
 */

// Preloading audio generates audio to grid, which will make the script slightly unresponsive atm
var preloadAudio = false;
var gridMode = 'grid'; // 'solfeggios' || 'grid' = for the sake of development convenience

var pluckedMax = 8;
var interval_length = 1000; 

var seqStepLengthDefault = 8;

var  PI=Math.PI,
     pi=Math.PI,
     phi = 1.61803398874989484820458683436563
    abs=Math.abs,
    sin=Math.sin,
   asin=Math.asin,
    cos=Math.cos,
    tan=Math.tan,
   atan=Math.atan,
  atan2=Math.atan2,
  floor=Math.floor,
   ceil=Math.ceil,
    max=Math.max,
    min=Math.min,
 random=Math.random,
  round=Math.round,
   sqrt=Math.sqrt,
    exp=Math.exp,
    log=Math.log,
    pow=Math.pow;

// Vertical structures of overtone scales
// It is important to keep the initial zero for dg1, otherwise 174 won't be played by algorithms.
var dg1 = [0, 174, 285, 396];
var dg2 = [714, 825, 936];
var dg3 = [111, 147, 258, 369, 471, 582, 693];
var dg4 = [417, 528, 639, 741, 852, 963, 987];
var dg5 = [333, 555, 888]; // Not added this time, make new groups as needed

var oddFrequencies = [7.83, 63.05, 136.1];
//var compromisedOddFrequencies = [8, 63, 136];

var solfeggios = dg1.concat(dg2, dg3, dg4, oddFrequencies);

var grid = []; // Store all freqs here first
var rowLength;
var waveCanvas = new Object(); // Contains wave data (floats or 255) assigned to freq cells { waveCanvas[freq] = samples }
var audioCanvas = new Object(); // Contains generated audio waves { audioCanvas[freq] = audio.play }

var sampleRate = 96000;
var samples_length = sampleRate; // divide by 2 ???
var samples = []; //new Float32Array(samples_length);

var base = 9; //When subtraction of Z returns a negative number
var zi = 9; //Z index
var freq;
var holyclass;
//var html; // Sacred Grid View

var plucked = [];
var pluckedColl = new Collection(); //Size grows until pluckedMax reached
var learned = new Collection();

var waveCollection = getWaveCollection(); // new Collection(); // {Collection}.count, .headers, .list, .item
var keyboardCollection = getKeyboardCollection(); // new Collection();

//var keyboardMode;
var sequenceRunning = false;

var sequenceCollection = new Collection();
//It will be best to create sequence structures from the UI / keyboard combo.
sequenceCollection.add('Random', [111]);
sequenceCollection.add('RandomOvertones', solfeggios);
sequenceCollection.add('StraightUp', [111, 222, 333, 444, 555, 666, 777, 888, 999]);

var currentSequences = [];
var csi = 0; //Current Sequence Index

var currentKeyboard;

/**
 *  Fill the grid with raw waveform samples
 *  Atm overwrites previous collection of audio
 */
function createWaveGrid(waveform) {

	samples_length = $('#samples_length').val();
	
	switch (gridMode) {
		case "solfeggios":
			for (i = 0; i < solfeggios.length; i++) {
				// Create samples
				var fnparams = [solfeggios[i], samples_length];
				var fn = window[waveform];

				if (typeof fn === "function") {
					waveCanvas[solfeggios[i]] = fn.apply(null, fnparams);
					if (preloadAudio === true)
						createWaveTone( solfeggios[i], waveCanvas[solfeggios[i]] );
				}
			}
		break;

		case "grid":
			
			for (i = 0; i < grid.length; i++) {
				var fnparams = [grid[i], samples_length];
				var fn = window[waveform];

				if (typeof fn === "function") {
					waveCanvas[grid[i]] = fn.apply(null, fnparams);
					if (preloadAudio === true)
						createWaveTone( grid[i], waveCanvas[grid[i]] );
				}
			}
		break;
	}
	console.log(waveCanvas);
}

/**
 * Generate Wave
 */
function createAudibleTone(freq, samples) {

	var wave = new RIFFWAVE();
	wave.header.sampleRate = sampleRate;
	wave.header.numChannels = 1;

	var audio = new Audio();
	if (freq == 7.83)
		audio.volume = 0.2;
	else
		audio.volume = 0.1
	//console.log(audio);

	wave.Make(waveCanvas[freq]);
	audio.src = wave.dataURI;
	
	if (preloadAudio === true)
		audioCanvas[freq] = audio;
	else
		audio.play();
}

function playTone(freq) {
	
	if (preloadAudio === true)
		audioCanvas[freq].play();
	else
		createAudibleTone(freq, waveCanvas[freq]);
}



/* * * ** *** *****  BEGIN UI  ***** *** ** * * */
/**
 * Grid layout to HTML
 * 
 * @param return String html
 */
function createSacredGridLayout() {

	var rgb;
	//var rgbx;
	//var rgby;
	//var rgbz;
	var ex = 0; //RGB color emphasis value

	html = '';
	for ( y = 9; y > 0; y-- ) {
		for ( x = 1; x <= 9; x++ ) {				
			z = zi - x;

			if ( z < 1 )
				z = base - (abs(z));
			if (x == 0) x = '';
			if (y == 0) y = '';
			//if (z == 0) z = '';
			
			if ( 1 == x / y / z )
				ex = x + 2; //color emphasis
			else
				ex = 0;
			//rgb = 'style="background-color: #'+ y + ex + z + z + x + ex +'" ';
			rgb = 'style="background-color: #'+ y + y + z + z + x + ex +'" ';

			freq = "" + x + y + z;
			if (freq.length < 2)
				console.log(freq + ' weirdo');

			if (freq.length > 0) {
				grid.push(freq);
			}
			
			holyclass = (solfeggios.indexOf(eval(freq)) == -1) ? '' : 'holy';	
			html += '<div id="'+ freq +'" '+ rgb +' class="freqButton '+ holyclass +'"><div class="plucked"><span>'+ freq +'</span></div><span class="default_grid_freq_view">'+ freq +'</span></div>';

			if ( x == 9 ) {
				zi = zi - 2;
				if ( zi < 2 ) 
					zi = 10;
				html += '<div class="clear"></div>';
			}
		}
	}
	html += '</div><div id="bonus">';
		for (i = 0; i < oddFrequencies.length; i++) {
			//rgb = 'style="background-color: #' + x + x + y + y + z + z + '" ';
			html += '<div id="'+ oddFrequencies[i] +'" class="freqButton holy"><div class="plucked"><span>'+ oddFrequencies[i] +'</span></div><span class="default_grid_freq_view">'+ oddFrequencies[i] +'</span></div>';
			grid.push(oddFrequencies[i]);
		}
	html += '</div>';

	return html;
}


/* * ** *** *****  Control functions, is there a better way to do these?  ***** *** ** * */

function prepareWaveSelector() {

	var active = '';
	var markup = '';
	var headers = waveCollection.list();
	for (i = 0; i < headers.length; i++) {
		if (headers[i] == 'Sinewave')
			active = ''; //was 'active'
		else
			active = '';
		markup += '<input type="button" class="ctrl_button '+ active +'" id="'+ waveCollection.item(headers[i]) +'" value="'+ headers[i] +'" /><br />';
	}

	return markup;
}

function prepareKbSelector() {
		
	var selected = '';
	var markup = '<label for="keyboardSelector">Keyboard mode</label>\
				<select id="keyboardSelector">';
	var kbList = keyboardCollection.list();

	for (i = 0; i < kbList.length; i++) {
	    if (kbList[i] == 'ZenOvertones')
	    	selected = 'selected';
	    else
	    	selected = '';
		markup += '<option '+ selected +' value="'+ kbList[i] +'">'+ kbList[i] +'</option>';
	}
	markup += '</select>';

	return markup;
}

function prepareSeqSelector() {
	
	var selected = '';
	var markup = '<label for="sequenceSelector">Pattern</label>\
				<select multiple id="sequenceSelector">';
	var seqList = sequenceCollection.list();
	for (i = 0; i < seqList.length; i++) {				
	    if (seqList[i] == 'Random')
	    	selected = 'selected';
	    else
	    	selected = '';
		markup += '<option '+ selected +' value="'+ seqList[i] +'">'+ seqList[i] +'</option>';
	}
	markup += '</select>\
				<label for="interval_length">Tempo</label>\
				<input type="text" id="interval_length" value="1000" />\
				<br />\
				<label for="samples_length">Time </label>\
				<input type="text" id="samples_length" value="96000" />';

	return markup;
}

function bufferWaveStream(f) {
	for (var channel = 0; channel < channels; channel++) {
            // This gives us the actual ArrayBuffer that contains the data
            var nowBuffering = myArrayBuffer.getChannelData(channel);
            for (var i = 0; i < frameCount; i++) {
                //nowBuffering[i] = bufferRuntimeCallback('fmod');
                nowBuffering[i] = sin( f*2*PI*i );
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
        var gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.5 * this.mVolume/100.0;

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

/**
 * Let's run this stuff
 */
$(document).ready(function () {
	
	$('#grid').append( createSacredGridLayout() );
	$('#waveSelector').append( prepareWaveSelector() );
	$('#kbSelector').append( prepareKbSelector() );
	setTimeout(function() { $('#seqSelector').append( prepareSeqSelector() ); }, 50 );
	//setTimeout(function() { audio.play(); }, 10);
	$('.plucked').hide();
	createWaveGrid('sinewave');

	//currentSequences = 
	//Must be array to handle multiple seqs at once. 
	//In the future add wave as parameter for each sequence :)
	currentKeyboard = $('#keyboardSelector option:selected').val();

	//Not working because of js written UI
	//$('#seq_start_stop').trigger('click');
	
	$('.freqButton').on('click', function() {
		
		var opa = 0.7;
		var pluckedElem = $(this).find('.plucked');
		var ptv = $(pluckedElem).text(); // Plucked Text Value

		playTone(ptv);

		//bufferWaveStream(ptv);

		var rgb = ptv;
		
		$(pluckedElem).show().css('opacity', opa);
		$(this).find('.default_grid_freq_view').hide();

		//Trails
		for (i = 0; i < plucked.length; i++) {
			var felem = $(plucked[plucked.length-i]).find('.plucked');
			if ($(felem).text() != ptv)
				$(felem).animate({'opacity' : opa-i/30}, 1);
			rgb[0] +=  $(felem).text()[0];
			rgb[1] +=  $(felem).text()[1];
			rgb[2] +=  $(felem).text()[2];
		}
		if (plucked.length == pluckedMax) {
			var fadePlucked = $(plucked[plucked.length - pluckedMax]);
			if ($(fadePlucked).text() != ptv) {
				$(fadePlucked).find('.plucked').hide();
				$(fadePlucked).find('.default_grid_freq_view').show();
			}
			plucked.shift();
			//console.log(plucked);
		}
		plucked.push(this);

		//console.log(rgb);
		//var colorSum = 
		$('#lumisonos').css('background-color', '#' + rgb[1] + rgb[1] + rgb[2] + rgb[2] + rgb[0] + rgb[0]);
		//$('body').css('background', 'radial-gradient(ellipse at center, rgba(65,74,91,1) 0%,rgba('+rgb[1]+rgb[1]+', '+rgb[2]+rgb[2]+', '+ rgb[0] + rgb[0] +',1) 100%)');
		//$('#grid').css('border-color', '#0301' + rgb[1] + rgb[1]);
	});
	
	/**
	 * Keyboard Player
	 * 
	 * @todo: Debug keyboard event validation
	 */
	$(document).on('keypress', function(event) {

		if (!event) event = window.event;
		console.log(event.which);
		//console.log(keyboardCollection.item(currentKeyboard)[event.key]);

		if (keyboardCollection.item(currentKeyboard)[event.key] != -1) {
			
			$("#"+keyboardCollection.item(currentKeyboard)[event.key]).trigger('click');	
		}
	});

	$('#waveSelector .ctrl_button').on('click', function() {

		createWaveGrid(this.id);

		if ( $(this).hasClass('active') )
			$(this).removeClass('active');
		else
			$(this).addClass('active').siblings().removeClass('active');
	});

	$('#seq_start_stop').on('click', function() {
		
		if (sequenceRunning == false) {
			sequenceRunning = true;
			$('#seq_start_stop').val('Stop').css('background-color', '#551111');
		}
		else {
			sequenceRunning = false;
			$('#seq_start_stop').val('Start').css('background-color', '#113411');
		}
	});

	$('#sequenceSelector').on('change', function() {

		currentSequence = this.value;
	});

	$('#keyboardSelector').on('change', function() {

		currentKeyboard = this.value;
	});

	$('#interval_length').on('blur', function(){
		
		interval_length = this.value;
	});

	$('#lumisonos').on('click', function() {

		for (var i = 0; i < plucked.length; i++) {
			$(plucked[i]).trigger('click');
		}
	});

	/**
	 * Begin algorithmical play
	 */
	var run = setInterval(function() {

		if (sequenceRunning == true) {
			
			//console.log(csi); //0-7
			//Random elements from Grid and Solfeggios
			if ( gridMode == 'grid') {
				var randomIndex = floor(random() * grid.length) + 1;
				var elem = "#" + grid[randomIndex];
			}
			else if ( gridMode == 'solfeggios') {
				var holyIndex = floor(random() * solfeggios.length) + 1;
				var elem = "#" + solfeggios[holyIndex];
			}
			
			var mod = csi % 2;
			if (mod == 1) {
				//playTone(63.05);
			}
			else {			
				$(elem).trigger('click');
				//playTone(7.83);
				//$('#'+7.83+' .plucked').css('display', 'block');
			}

			csi++;
			if (csi == seqStepLengthDefault)
				csi = 0;
			
		}

	}, interval_length);


});




