/**
 * Ascension Synthesizer
 * Lo Shu Solfeggio Wavetable Designer / Microtonal Composer Concept
 * Version 0.5
 * 
 * References, inspiration
 *
 * Miika Kuisma / miikakuisma.com
 * Sakari Lehtonen / geokone.net
 * Tim Wessman / lossidesign.fi
 * Karlheinz Stockhausen
 * Nassim Haramein
 * Mooji
 * God
 * 
 * Stephen M. Phillips http://www.smphillips.8m.com/article-31.html
 * Marshall Lefferts http://cosmometry.net/basics-of-the-music-system
 * Curtis MacDonald / http://www.curtismacdonald.com/lo-shu-or-solfeggio-tonality-templates/
 * 
 * Written by Miika Luolajan-Mikkola, 2014
 * 
 */

//var preloadAudio = false;
var gridMode = 'grid'; // 'solfeggios' || 'grid' = for the sake of development convenience
var soloMouseRunning = false;
var pluckedMax = 8;
var interval_length = 363.636363; // Triplets at 55 bpm, makes 21 bar cycle maybe? Test.

var  PI = Math.PI,
     pi = Math.PI,
    phi = 1.61803398874989484820458683436563,
   cbrt = Math.cbrt, // cube root of a number
    abs = Math.abs,
    sin = Math.sin,
   asin = Math.asin,
    cos = Math.cos,
    tan = Math.tan,
   atan = Math.atan,
  atan2 = Math.atan2,
  floor = Math.floor,
   ceil = Math.ceil,
    max = Math.max,
    min = Math.min,
 random = Math.random,
  round = Math.round,
   sqrt = Math.sqrt,
    exp = Math.exp,
    log = Math.log,
    pow = Math.pow;

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
var waveCanvas = new Object(); // Contains wave data (floats or 255) assigned to freq cells { waveCanvas[freq] = samples }

var base = 9; //When subtraction of Z returns a negative number, these are ugly hacks
var zi = 9; //Z index, growing by two on every x+yn

var freq;
var holyclass;

var plucked = [];
var pluckedColl = new Collection();
var learned = new Collection();
var pluckedOpacityOffset = 0.1; // must match with CSS

var waveCollection = getWaveCollection();
var keyboardCollection = getKeyboardCollection();

var temperingCollection = getTemperingCollection();
var currentTempering = 'Lo Shu Natural';

var sequenceRunning = false;


var chakras     = [111, 333, 528, 444, 639, 741, 666]; // This goes to sequence container
var chakraName = ['root', 'sacral', 'solar', 'heart', 'throat', 'third', 'crown'];

var hypnotree = [111, 333, 444, 528, 639, 258, 369, 666];
var treeoflifevary = [111, 333, 444, 528, 639, 741, 258, 369, 471, 666];
var treeoflife 	   = [111, 333, 528, 258, 369, 471, 444,  639, 741, 258, 369, 471, 666];
// sum 3348, 8-div 418.5, sqr 57,86190456595773
var floweroflife = [];


var sequenceCollection = new Collection();
//It will be best to create sequence structures from the UI / keyboard combo.
sequenceCollection.add('Tree of Life', treeoflife);
sequenceCollection.add('Hypno Tree', hypnotree);
sequenceCollection.add('Chakras', chakras);
sequenceCollection.add('RandomOvertones', solfeggios);
sequenceCollection.add('Random', [666]);
sequenceCollection.add('StraightUp', [111, 222, 333, 444, 555, 666, 777, 888, 999]);

var currentSequence;
var csi = 0; //Current Sequence Index

//var keyboardMode; // Y no have keyboardMode here?
var currentKeyboard;

var webSynth = null;


/**
 *	Iterate through Grid, create and bind wavedata to waveCanvas. Even if the use of Web Audio API becomes
 *	exclusive, this might be useful for future User Wave generation, "export mp3" etc.
 * 
 *  Fill the grid with raw waveform samples
 *  Atm overwrites previous collection of audio
 */
function createWaveGrid(waveform) {
	
	switch (gridMode) {
		case "solfeggios":
			for (i = 0; i < solfeggios.length; i++) {
				// Create samples
				var fnparams = [solfeggios[i]];
				var fn = window[waveform];

				if (typeof fn === "function") {
					// Callback
					waveCanvas[solfeggios[i]] = fn.apply(null, fnparams);
				}
			}
		break;

		case "grid":
			//waveCanvas.clear();
			for (i = 0; i < grid.length; i++) {
				var fnparams = [grid[i]];
				var fn = window[waveform];

				if (typeof fn === "function") {

					waveCanvas[grid[i]] = fn.apply(null, fnparams);
				}
			}
		break;
	}
	//console.log(waveCanvas);
}


/**
 *  Calls to Web Audio API
 */
function playTone(freq) {

	// WAVE generation and Audio Context buffering
	if ( waveCanvas[freq] ) {
		//Now we have samples to use SPN with our JS methods in waves.js
		//console.log('buffering samples');
		//bufferWaveStream( waveCanvas[freq]);

		//console.log(samples);
	    for (var channel = 0; channel < asBufferChannels; channel++) {
	        
	        //var nowBuffering = asBuffer.getChannelData(channel);
	        var nowBuffering = asBuffer.getChannelData(channel);
	        
	        for (var i = 0; i < sampleRate; i++) {
	            //nowBuffering[i] = bufferRuntimeCallback('fmod');
	            //nowBuffering[i] = sin( 2*PI*i );
	            nowBuffering[i] = waveCanvas[freq][i];
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
	// OSCILLATOR and Script Processor Node
	else {
		bufferOscStream(0.1, freq);
		/*init = Math.max(0.1, AC.currentTime);
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

	    // SPN
	    var SPN = EnvelopeHandler(init, handler, (function () { // orig params input, output, init, egStoptime, handler
        
	        var amplitude = asAmplitude;
	        //var attack = Math.exp(1.6180 / (asAttack * AC.sampleRate)); 
	        var decay = Math.exp(- 1.6180 / (asDecay * AC.sampleRate));
	        var sustain = asSustain;
	        var release = asRelease;
	        //console.log(decay); // Try to find the meaning of decay's float values
	        
	        return function (event, fromSamp, toSamp) {

	            var i, inp, out;
	            
	            inp = event.inputBuffer.getChannelData(0);
	            out = event.outputBuffer.getChannelData(0);
	            // Attack
	            for (i = init; i < fromSamp; ++i, amplitude *= asAttack) {

	                out[i] =  amplitude * inp[i];
	            }
	            // Decay
	            for (i = fromSamp; i < toSamp; ++i, amplitude *= decay) {
	                
	                filter.frequency.value = amplitude^2 * asFilterCutoff;
	                
	                out[i] = amplitude * inp[i];
	                if (out[i] > 1) out[i] = 1;
	                if (out[i] < -1) out[i] = -1;          
	                //out[i] =  amplitude * noise( inp[i]);       
	            }
	        };
	    }()));

	    osc.connect(filter);
	    filter.connect(gain);
	    gain.connect(SPN);
	    ////gain.connect(SPN);
	    //SPN.connect(AC.destination);

	    osc.start(init);
	    osc.stop(egStoptime);
	    //filter.frequency.value  = asFilterCutoff || 528; //Hz
	    filter.frequency.value  = Math.pow(2.0, (freq + 30) / 10);
	    filter.Q.value          = asFilterResonance || 13; // Param range unknown
	    filter.gain.value       = asFilterGain || 1;
		/**/
	}

	if ( webSynth != null) {
		//console.log('websynth play');
		//setTimeout(function(){ webSynth.play(freq); }, 1000);
		//webSynth.play(freq);
	}

	//return;

}

/**
 * Parameter to be given to this function should be designed carefully!
 * When multiple different tones are playing, it has to know the whole data structure
 * 
 */
function stopTone(freq) {
	
	//webSynth.stop();
}


/*****  BEGIN UI  ******/
/**
 * Grid layout to HTML
 * 
 * @param return String html
 */
function createSacredGridLayout(tempering) {

	var x, y, z;
	var rgb;
	//var rgbx;
	//var rgby;
	//var rgbz;
	var ex = 0; //RGB color emphasis value

	var html = '<div id="gridWrapper">';

	for ( y = base; y >= 0; y-- ) {
		for ( x = 0; x <= base; x++ ) {	

			//var alpha, cos, tan;
			//z = cos(x);
			z = zi - x;
			if ( z < 1 )
				z = base - (abs(z));
			
			if (x&y&z==0) {
				html += '<div id="silence" class="freqButton"><div class="plucked"></div><span class="default_grid_freq_view noselect">Silence</span></div>';
				continue;
			}

			if (x / y / z == 1) {
				var rgbOct = "" + x + y + z;
				rgb = ' ' + (pow(z, 2) + rgbOct[0] + rgbOct[1] + rgbOct[2]); // * 2
				//console.log(rgb);
				rgb = 'style="background-color: #CC0133" ';
			}
			else {
				//rgb = 'style="background-color: #'+ y + ex + z + z + x + ex +'" ';
				rgb = 'style="background-color: #'+ z + z + x + x + y + y +'" ';
			}

			if (x == 0) x = '';
			if (y == 10) y = '';
			if (z == 10) z = 1;

			freq = "" + x + y + z;

			// Insert Tempering algorithm
			switch (tempering) {
				case 'Lo Shu Natural':
					tprOctaveRange = [1, 999]; // || 1000?
					tprToneSteps   = 100;
					// var tprRelativeRatioVector
					freq = freq;
				break;
				case 'Cuberoot':
					// Does this lead us to Stockhausen Studie II with 100Hz bottom?
					var cubeRoot = round(cbrt(freq) * 100); 
					freq = cubeRoot;
					//console.log('Cuberoot of '+ freq + ': ' + cubeRoot);
				break;
				case '12-TET':
					tprOctaveRange = [1, 111]; // || 100?
					tprToneSteps   = 12;
					// z = octave, y = steps - Problem ahead with y
				break;
			}
			//temperingCollection.item( tempering);
			//if (freq.length == 0) 
				//console.log(freq + ' - mishandled freq');

			if (freq.length > 0) 
				grid.push(freq);
			
			holyclass = (solfeggios.indexOf(eval(freq)) == -1) ? '' : 'omniHoly'; // implement to css

			var chakraIndex = chakras.indexOf(eval(freq));
			var chakraClass = '';
			if (chakraIndex > -1)
				chakraClass += chakraName[chakraIndex];	
			/**
			 * Construct Grid Button
			 */
			html += '<div '+ rgb +' class="freqButton '+ holyclass +'">\
						<a id="'+ freq +'" '+ rgb +' class="noselect ' + chakraClass + '">\
							<span class="plucked">'+ freq +'</span>\
						</a>\
					</div>';

			if ( x == 9 ) {
				zi = zi - 2;
				if ( zi < 2 ) 
					zi = 10;
				html += '<div class="clear"></div>';
			}
		}
	}
	html += '</div>';
	html += '<div id="bonus">';
		for (i = 0; i < oddFrequencies.length; i++) {
			//rgb = 'style="background-color: #' + x + x + y + y + z + z + '" ';
			html += '<div class="freqButton holy">\
						<a id="'+ oddFrequencies[i] +'" class="noselect">\
							<span class="plucked">'+ oddFrequencies[i] +'</span>\
						</a>\
					</div>';
			grid.push(oddFrequencies[i]);
		}
	html += '</div></div>';

	return html;
}


/* * ** *** *****  Control functions, is there a better way to do these?  ***** *** ** * */

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

function prepareTemperingSelector() {

	var selected = '';
	var markup = '<label for="temperingSelector">Tempering</label>\
				<select id="temperingSelector">';
	var tprList = temperingCollection.list();

	for (i = 0; i < tprList.length; i++) {
	    if (tprList[i] == 'Lo Shu Natural')
	    	selected = '';
	    else
	    	selected = '';
	
	    // Value could contain function name if tempering becomes abstracted. Now it's part of grid layout creation.
		markup += '<option '+ selected +' value="'+ tprList[i] +'">'+ tprList[i] +'</option>';
	}
	markup += '</select>';

	return markup;
}

function prepareWaveSelector() {

	var active = '';
	var markup = '<label for="waveSelector">Wave</label>';
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

function prepareSeqSelector() {
	
	var selected = '';
	var markup = '<label for="sequenceSelector">Pattern</label>\
				  <select id="sequenceSelector">';
	var seqList = sequenceCollection.list();
	for (i = 0; i < seqList.length; i++) {				
	    if (seqList[i] == 'Hypno Tree')
	    	selected = 'selected';
	    else
	    	selected = '';
		markup += '<option '+ selected +' value="'+ seqList[i] +'">'+ seqList[i] +'</option>';
	}
	markup += '</select>';

	return markup;
}

function prepareSettings() {

	// Buffer
	var selected = '';
	var markup = '<label for="bufferSize">Buffer</label>\
				  <select id="bufferSize">';
	for (i = 0; i < asBufferSize.length; i++) {				
	    if (asBufferSize[i] == '4096')
	    	selected = 'selected';
	    else
	    	selected = '';
		markup += '<option '+ selected +' value="'+ asBufferSize[i] +'">'+ asBufferSize[i] +'</option>';
	}
	markup += '</select>';

	return markup;
}


function freqButtonEventHandle(freqButton, soloMouse) {

		//freqButton is now anchor

		var pluckedElem = $(freqButton).find('.plucked');
		//console.log(pluckedElem); //span class="plucked", text() = freq
		var ptv = $(freqButton).attr('id'); // anchor's id

		playTone(ptv);

		if(soloMouse == true)
			soloMouseRunning = true;

		var rgb = ptv;
		var opa =  0.8;
		var chakraOpa = 0.6;

		$(pluckedElem).css('opacity', opa);//.parent('div').css('border-color', 'rgb(36%, 119%, 163%)');
		//$(freqButton).find('.default_grid_freq_view').hide();
		
		
		
		console.log(plucked);

		//Trails
		for (i = 0; i < plucked.length; i++) {
			var felem = $(plucked[plucked.length - i]);//.find('plucked');
			//console.log(felem);
			if ($(pluckedElem).text() != $(felem).text()) {
				if ((chakras.indexOf(eval($(felem).text())) > -1 ))
					$(felem).css('opacity', opa-i/25);
				else
					$(felem).css('opacity', opa-i/25);
			}
			else {
				console.log('prevent repeated pluck fade' + $(felem).text());
				$(felem).css('opacity', opa);
			}	
			//rgb[0] +=  $(felem).attr('id')[0];
			//rgb[1] +=  $(felem).attr('id')[1];
			//rgb[2] +=  $(felem).attr('id')[2];
		}
		if (plucked.length == pluckedMax) {
			var fadePlucked = $(plucked[plucked.length - pluckedMax]);
			if ($(fadePlucked).text() != ptv) {
				$(fadePlucked).css('opacity', pluckedOpacityOffset);
				$(fadePlucked).find('.default_grid_freq_view').show();
				plucked.shift();
			}
		}
		plucked.push(freqButton);
		$('#lumisonos').css('background-color', '#' + rgb[1] + rgb[1] + rgb[2] + rgb[2] + rgb[0] + rgb[0]);
		//$('body').css('background', 'radial-gradient(ellipse at center, rgba(65,74,91,1) 0%,rgba('+rgb[1]+rgb[1]+', '+rgb[2]+rgb[2]+', '+ rgb[0] + rgb[0] +',1) 100%)');
		//$('#grid').css('border-color', '#0301' + rgb[1] + rgb[1]);
		
}

function prepareAscension(tempering) {

	currentTempering = tempering | currentTempering;

	$('#grid').append( createSacredGridLayout( currentTempering) );
	$('#kbSelector').append( prepareKbSelector() );
	$('#temperingSelector').append( prepareTemperingSelector() );
	$('#waveSelector').append( prepareWaveSelector() );
	$('#seqSelector').append( prepareSeqSelector() );
	$('#settings').append( prepareSettings() );
	//setTimeout(function(){
	$('.wsBtnWrap').each(function(){
		var w = parseInt( $(this).find('input').attr('data-width'), 10);
		var h = parseInt( $(this).find('input').attr('data-height'), 10);
		$(this).css('width', w + 6 ).css('height', h + 6 );
		$(this).find('input').attr('data-bgcolor', '#ff0000'); //Fyi doesn't affect canvas drawn color 
		//data-bgcolor="#8080aa" data-fgcolor="#22cc22" data-inputcolor="#d5d5d5"
	});
	//}, 1000);
	$('.knob').knob();
	//createWaveGrid('sinewave');
	// Warning! Websynth may shutdown audio node completely, has been improved in playTone handling but not tested.
	//webSynth = new WebSynth();
	currentSequence = $('#sequenceSelector option:selected').val();
	//Must be array to handle multiple seqs at once. 
	currentKeyboard = $('#keyboardSelector option:selected').val();
}

function refreshDelegates() {

	$('.freqButton').delegate('a','mousedown', function() {
		freqButtonEventHandle(this, true);
		return false;
	});

	$('.freqButton').delegate('a','hover', function() {

		if (soloMouseRunning == true) {
			freqButtonEventHandle(this);
		}
		return false;
	});
	
	$('#grid').delegate('.freqButton', 'mouseup', function() {

		soloMouseRunning = false;
		//stopTone();
		return false;
	});
}


$(document).ready(function () {
	
	prepareAscension( currentTempering);
	refreshDelegates();

	/**
	 * 	Events of Expression
	 */
	//$('#seq_start_stop').trigger('click');

	$('.wsBtnWrap').bind('mousewheel DOMMouseScroll', function(event){
		changeKnob(this);
	});

	$('.wsBtnWrap').on('mouseup', function() {
		changeKnob(this);
	})

	$('.wsBtnWrap').on('mouseover', function() {

		$(this).find('span').css('color', '#22cc22'); 
	});

	$('.wsBtnWrap').on('mouseout', function() {

		$(this).find('span').css('color', '#616181'); 
	});

	/**
	 * Keyboard Player
	 * 
	 * @todo: Keyboard  Improve keyboard event validation.
	 */
	var keyDown = [];
	$(document).on('keydown', function(event) {

		//console.log(event.which);
		if (!event) event = window.event;
		if (keyboardCollection.item(currentKeyboard)[ kbEventNumber[event.which] ] != -1) {
			var elem = $("#"+keyboardCollection.item(currentKeyboard)[ kbEventNumber[event.which] ]);
			//console.log($(elem).children());
			if(keyDown.indexOf($(elem).attr('id')) > -1 ) {
				return;
			}
			else {
				$(elem).trigger('mousedown');
				keyDown.push($(elem).attr('id'));
			}
			//console.log(elem);	
			//$("#"+keyboardCollection.item(currentKeyboard)[ kbEventNumber[event.which]  ]).trigger('mousedown');	
		}
	});

	$(document).on('keyup', function(event) {
		
		var elem = $("#"+keyboardCollection.item(currentKeyboard)[ kbEventNumber[event.which] ]);
		var kdindex = keyDown.indexOf(eval($(elem).attr('id')));
		keyDown.splice(kdindex, 1);
		$(elem).trigger('mouseup'); 
	});

	/**
	 * Control area events
	 */
	$('#waveSelector .ctrl_button').on('click', function() {

		createWaveGrid(this.id);

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

	/**
	 * Testing new grid for different temperaments.
	 * @return {[type]} [description]
	 */
	$('#temperingSelector').on('change', function(){

		currentTempering = $(this).find('option:selected').attr('value');
		$('#bonus').remove();
		$('#gridWrapper').remove();
		
		var newAsLayout = createSacredGridLayout(currentTempering);
		$('#grid').append(newAsLayout);
		refreshDelegates();
	});


	$('#bufferSize').on('change', function(){
		
		kBufferLength = this.value;
	});

	$('#lumisonos').on('click', function() {
		
		var pl = plucked.length + 1;
		for (var i = 1; i <= pl; i++) {
			//console.log(plucked[i]);
			playTone( $(plucked[i]).attr('id') ) ;
			//$(plucked[i]).trigger('click');
		}
	});

	/****** Synth Knob Events ******/

	function changeKnob(inputElem) {
		
		var input = $(inputElem).find('input'); 

		switch ( $(input).attr('id')) {
			case "vco1wave":
				asOscType = oscTypes[ $(input).val() - 1];
			break;
			case "vco1gain":
				asOscGain = $(input).val();
			break;
			case "vco1fine":
				asDetune = $(input).val();
			break;
			case "filterType":
				asFilterType = filterTypes[ $(input).val() -1];
			break;
			case "filterFreq":
				asFilterCutoff = $(input).val();
			break;
			case "resonance":
				asFilterResonance = $(input).val();
			break;
			case "filterGain":
				asFilterGain = $(input).val();
			break;
			case "volume":
				asAmplitude = $(input).val();
			break;
			case "eg_a":
				asAttack = $(input).val();
			break;
			case "eg_d":
				asDecay = $(input).val();
			break;
			default:
		}
	};

	
	/*
	$('.knob #glideTime').on('change', function() {
		
		webSynth.vco1.set_glide_time( $(this).val() );
		webSynth.vco2.set_glide_time( $(this).val() );
		
	}).appendTo('#synthesisControls');

	$('.knob #glideToggle').on('change', function(){
		
		webSynth.vco1.set_glide_on($(this).val());
		webSynth.vco2.set_glide_on($(this).val());

	}).appendTo('#synthesisControls');

	$('.knob #vco1pitch').on('change', function() {
		change: (function() { webSynth.vco1.set_pitch($(this).val()); })
	}).appendTo('#synthesisControls');

	$('.knob #vco2pitch').on('change', function() {
		change: (function() { webSynth.vco2.set_pitch($(this).val()); })
	}).appendTo('#synthesisControls');
	webSynth.vco2.set_pitch(0);

	$('.knob #vco1fine').on('change', function() {
		change: (function() { webSynth.vco1.set_fine($(this).val()); })
	}).appendTo('#synthesisControls');

	$('.knob #vco2fine').on('change', function() {
		change: (function() { webSynth.vco2.set_fine($(this).val()); })
	}).appendTo('#synthesisControls');

	$('.knob #vco1wave').on('change', function() {
		change: (function() { webSynth.vco1.set_wave($(this).val()); })
	}).appendTo('#synthesisControls');

	$('.knob #vco2wave').on('change', function() {
		change: (function() { webSynth.vco2.set_wave($(this).val()); })
	}).appendTo('#synthesisControls');


	$('.knob #vco1gain').on('change', function() {
		change: (function() { webSynth.vco1.set_gain($(this).val()); })
	}).appendTo('#synthesisControls');

	$('.knob #vco1toggle').on('change', function() {
		click: (function() { webSynth.vco1.set_on($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #vco2gain').on('change', function() {
		change: (function() { webSynth.vco2.set_gain($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #vco2toggle').on('change', function() {
		click: (function() { webSynth.vco2.set_on($(this).val());} )
	}).appendTo('#synthesisControls');

	$('.knob #filterFreq').on('change', function() {
		change: (function() { webSynth.filter.set_freq($(this).val());} )
	}).appendTo('#synthesisControls');

	$('.knob #resonance').on('change', function() {
		change: (function() { webSynth.filter.set_q($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #envAmount').on('change', function() {
		change: (function() { webSynth.filter.set_amount($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #feg_a').on('change', function() {
		change: (function() { webSynth.feg.set_a($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #feg_d').on('change', function() {
		change: (function() { 
			webSynth.feg.set_d($(this).val()); 
			//webSynth.feg.set_r($(this).val());
		})
	}).appendTo('#synthesisControls');

	$('.knob #feg_s').on('change', function() {
		change: (function() { webSynth.feg.set_s($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #feg_r').on('change', function() {
		change: (function() { 
			//webSynth.feg.set_d($(this).val()); 
			webSynth.feg.set_r($(this).val());
		})
	}).appendTo('#synthesisControls');

	$('.knob #eg_a').on('change', function() {
		change: (function() { webSynth.eg.set_a($(this).val()); } )
	}).appendTo('#synthesisControls');
	
	$('#eg_d').on('change', function() {
		change: (function() { 
			console.log('success');
			asDecay = $(this).val();
			//webSynth.eg.set_d($(this).val()); 
		})
	});//.appendTo('#synthesisControls');
	/*
	$('.knob #eg_s').on('change', function() {
		change: (function() { webSynth.eg.set_s($(this).val()); } )
	}).appendTo('#synthesisControls');
	
	$('#eg_r').on('change', function() {
		change: (function() {
			console.log('success');
			acDecay = $(this).val(); 
			//webSynth.eg.set_r($(this).val());
		})
	}); //.appendTo('#synthesisControls');
	
	$('.knob #volume').on('change', function() {
		change: (function() { webSynth.volume.set($(this).val()); } )
	}).appendTo('#synthesisControls');

	$('.knob #delay').on('change', function() {
		//wet gain val
		change: (function() { webSynth.delay.set($(this).val()); } )
	}).appendTo('#synthesisControls');
	/**/

	/**
	 * To be developed Knob Lights, KnobKnob, deprecating maybe
	 * @type {Array}
	 */
	var colors = [
        '26e000','2fe300','37e700','45ea00','51ef00',
        '61f800','6bfb00','77ff02','80ff05','8cff09',
        '93ff0b','9eff09','a9ff07','c2ff03','d7ff07',
        'f2ff0a','fff30a','ffdc09','ffce0a','ffc30a',
        'ffb509','ffa808','ff9908','ff8607','ff7005',
        'ff5f04','ff4f03','f83a00','ee2b00','e52000'
    ];

    var rad2deg = 180/Math.PI;
    var deg = 0;
    var bars = $('#bars');

    for(var i = 0; i < colors.length; i++){

        deg = i * 12;

        $('<div class="colorBar">').css({
            backgroundColor: '#'+colors[i],
            transform:'rotate('+deg+'deg)',
            top: -Math.sin(deg/rad2deg)*80+100,
            left: Math.cos((180 - deg)/rad2deg)*80+100,
        }).appendTo(bars);
    }

    var colorBars = bars.find('.colorBar');
    var numBars = 0, lastNum = -1;

	/*
	$('#synthesisControls .knob').knobKnob({
		//console.log(this);

	    snap : 10,
	    value: 154,
	    turn : function(ratio){
	        // Do what you want here. Ratio moves from 0 to 1
	        // relative to the knob rotation. 0 - off, 1 - max
	        
	        numBars = Math.round(colorBars.length*ratio);
            // Update the dom only when the number of active bars
            // changes, instead of on every move
            if(numBars == lastNum){
                return false;
            }
            lastNum = numBars;
            colorBars.removeClass('active').slice(0, numBars).addClass('active');
	    }
	});
	/* END KnobKnob */

	/**
	 * Begin algorithmical play
	 */
	
	var run = setInterval(function() {

		if (sequenceRunning == true) {
			
			/** 
			 * If we want accurate timing, AudioContext source.start should be given a structure of 
			 * different tones with their own starttimes. This data structure should be designed.
			 * Unless we find a way to run setInterval() really reliably.
			 */

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
			
			//var mod = ;
			if (csi % 2 == 1) {
				//playTone(63.05);
			}

			freqButtonEventHandle( "a#"+sequenceCollection.item(currentSequence)[ csi ], false);

			//freqButtonEventHandle( '#' + treeoflife[csi], false);
			//freqButtonEventHandle( elem, false);		
			//playTone(7.83); // in case we don't want to see seq events on the Grid
		
			csi++;
			if (csi == sequenceCollection.item(currentSequence).length)
				csi = 0;
			
		}

	}, interval_length);
	

});