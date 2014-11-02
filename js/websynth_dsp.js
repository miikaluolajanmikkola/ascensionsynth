/*
 * websynth_dsp.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2012, aike (@aike1000)
 *
 */


///////////// BROWSER CHECK /////////////////////

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.addEventListener('load', init, false);
function init() {
	try {
		var context = new AudioContext() ;
	} catch(e) {
		alert('Web Audio API is not supported in this browser');
	}
};



///////////// GLIDE /////////////////////
var Glide = function() {
	this.time  = 10;
	this.delta = 1 / (this.time * 100 + 1);
	this.on    = 1;
	this.current_pitch = -1;
	this.goal_pitch    = -1;
	this.cnt = 0;
};

Glide.prototype.set_goal = function(val) {
	this.goal_pitch = val;
};

Glide.prototype.next = function(p) {

	if (this.on == 0) {
		return p;
	} else if ((this.time == 0) || (this.current_pitch == -1)) {
		this.current_pitch = p;
		this.goal_pitch = p;
	} else {
		this.cnt++;
		if (this.cnt > this.time * 10) {
			if (Math.abs(this.goal_pitch - this.current_pitch) < Math.abs(this.delta))
				this.current_pitch = this.goal_pitch;
			else
				this.current_pitch += this.delta;
			this.cnt = 0;
		}
	}
	return this.current_pitch;
};

Glide.prototype.set_time = function(val) {
	this.time = val;
	this.delta = 1 / (val * 100 + 1);
};

Glide.prototype.set_on = function(val) {
	this.on = val;
};

///////////// Init Parameter /////////////////////
var stream_length = 4096;
//var stream_length = 1024;

///////////// VCO /////////////////////
var WAVE = {
	SINE	: 0,
	TRI		: 1,
	SAW		: 2,
	SQUARE	: 3
};

var VCO = function(samplerate) {
    this.phase = 0.0;
	var frequency = 110;
    this.phaseStep = frequency / samplerate;

	this.oct   = 12;
	this.fine  = 0;
	this.wave  = WAVE.SAW;
	this.gain  = 0.5;
	this.on    = 1;

	this.glide = new Glide();
};

VCO.prototype.SineNext = function(p) {
	var phase = this.phase;
	var w = 2 / p;
	if (phase > w)		// if (this.phase * p * Math.PI > 2 * Math.PI)
		phase -= w;
	var ret = Math.sin(phase * p * Math.PI);
    this.phase = phase + this.phaseStep;
    return ret;
};

VCO.prototype.SquareNext = function(p) {
	var phase = this.phase;
	var w = 2 / p;
	if (phase > w) {
		phase -= w;
	}
	var ret = phase * p > 1 ? 0.8 : -0.8;
    this.phase = phase + this.phaseStep;
    return ret;
};

VCO.prototype.SawNext = function(p) {
	var phase = this.phase;
	var w = 2 / p;
	if (phase > w)
		phase -= w;
	var r = phase * p;
    var ret = r - 1;
    this.phase = phase + this.phaseStep;
    return ret;
};

VCO.prototype.TriNext = function(p) {
	var phase = this.phase;
	var w = 2 / p;
	if (phase > w)
		phase -= w;
	var r = phase * p;
    var ret = 2 * ((r >= 1 ? 2 - r : r) - 0.5);
    this.phase = phase + this.phaseStep;
    return ret;
};

VCO.prototype.next = function(p) {
	var stream = [];
	var i, imax;
	if (this.on == 1) {
		switch (this.wave) {
			case WAVE.SINE:
				for (i = 0, imax = stream_length; i < imax; i++)
					stream[i] = this.SineNext(this.glide.next(p)) * this.gain;
				break;
			case WAVE.TRI:
				for (i = 0, imax = stream_length; i < imax; i++)
					stream[i] = this.TriNext(this.glide.next(p)) * this.gain;
				break;
			case WAVE.SAW:
				for (i = 0, imax = stream_length; i < imax; i++)
					stream[i] = this.SawNext(this.glide.next(p)) * this.gain;
				break;
			case WAVE.SQUARE:
				for (i = 0, imax = stream_length; i < imax; i++)
					stream[i] = this.SquareNext(this.glide.next(p)) * this.gain;
				break;
		}
	} else {
		for (i = 0, imax = stream_length; i < imax; i++) {
			stream[i] = 0;
		}
	}
	return stream;
};

VCO.prototype.set_pitch = function(p) {
	this.oct = Math.floor((p + 25) / 50) * 12;
};

VCO.prototype.set_fine = function(p) {
	this.fine = (p - 50) / 100;
};

VCO.prototype.set_wave = function(val) {
	val = Math.floor((val + 25) / 50);

	switch(val) {
	case 0:
		this.wave = WAVE.TRI;
		break;

	case 1:
		this.wave = WAVE.SAW;
		break;

	case 2:
		this.wave = WAVE.SQUARE;
		break;
/*
	default:
	case 3:
		this.wave = WAVE.SINE;
		break;
*/
	}
};

VCO.prototype.reset_phase = function(p) {
	this.phase = 3 / 2 / this.glide.goal_pitch;
//	this.phase = 0;
};

VCO.prototype.set_gain = function(val) {
	this.gain = val / 100;
};

VCO.prototype.set_on = function(val) {
	this.on = val;
};

VCO.prototype.set_glide_time = function(val) {
	this.glide.set_time(val);
};

VCO.prototype.set_glide_on = function(val) {
	this.glide.on = val;
};

VCO.prototype.set_goal_pitch = function(val) {
	this.glide.goal_pitch = val;
};

VCO.prototype.glide_init = function(p) {
	if (this.glide.current_pitch == -1)
		this.glide.current_pitch = p;
	this.glide.goal_pitch = p;
	this.glide.delta = (p - this.glide.current_pitch) / 50;
};

///////////// EG /////////////////////

var EGM = {
	Idle    : 0,
	Attack  : 1,
	Decay   : 2,
	Sustain : 3,
	Release : 4
};

var EG = function() {
	this.gain = 0.0;
	this.time = 0;
	this.mode = EGM.Idle;
	this.a = 0;
	this.d = 20;
	this.s = 100 / 100;
	this.r = 20;

	this.a_max = 100;
	this.d_max = 100;
	this.r_max = 100;

	this.a_delta = 1.0 / (this.a * 500 + 1);
	this.d_delta = 1.0 / ((this.d + 5) * 1000 + 1);
	this.r_delta = 1.0 / (this.r * 1000 + 1);
};

EG.prototype.set_a = function(val) {
	this.a = val;
	this.a_delta = 1.0 / (this.a * 500 + 1);
};
EG.prototype.set_d = function(val) {
	this.d = val;
	this.d_delta = 1.0 / ((this.d + 5) * 1000 + 1);
};
EG.prototype.set_s = function(val) {
	this.s = val / 100.0;
};
EG.prototype.set_r = function(val) {
	this.r = val;
	this.r_delta = 1.0 / (this.r * 1000 + 1);;
};

EG.prototype.note_on = function() {
	this.gain = 0.0;
	this.time = 0;
	this.mode = EGM.Attack;
};

EG.prototype.note_off = function() {
	this.mode = EGM.Release;
};

EG.prototype.next = function() {
	this.time = 0;

	switch (this.mode) {
		case EGM.Attack:
			this.gain += this.a_delta;
			if (this.gain >= 1.0) {
				this.gain = 1.0;
				this.mode = EGM.Decay;
			}
			break;
		case EGM.Decay:
			this.gain -= this.d_delta;
			if (this.gain <= this.s) {
				this.gain = this.s;
				this.mode = EGM.Sustain;
			}
			break;
		case EGM.Sustain:
			break;
		case EGM.Release:
			this.gain -= this.r_delta;
			if (this.gain <= 0.0) {
				this.gain = 0.0;
				this.mode = EGM.Idle;
			}
			break;
	}
};


///////////// VOLUME /////////////////////
var CTL_Volume = function(ctx) {
	this.volume = ctx.createGain();
    this.volume.gain.value = 0.5;
};

CTL_Volume.prototype.set = function(val) {
    this.volume.gain.value = val / 100.0;
};

CTL_Volume.prototype.connect = function(next_node) {
	this.volume.connect(next_node);
};

CTL_Volume.prototype.getnode = function() {
	return this.volume;
};

///////////// DELAY /////////////////////
var FX_Delay = function(ctx) {
	this.wet = 0.2;
	this.delaytime = 0.8;
    this.delay1 = ctx.createDelay();
    this.delay2 = ctx.createDelay();
	this.gain1 = ctx.createGain();
	this.gain2 = ctx.createGain();

    this.delay1.delayTime.value = this.delaytime * 0.5;
    this.delay2.delayTime.value = this.delaytime * 1.0;
    this.gain1.gain.value = this.wet * 0.25;
    this.gain2.gain.value = this.wet * 0.125;

	this.gain1.connect(this.delay1);
	this.gain2.connect(this.delay2);
};

FX_Delay.prototype.on = function(val) {
	if (val > 0) {
	    this.gain1.gain.value = this.wet * 0.25;
	    this.gain2.gain.value = this.wet * 0.125;
	} else {
	    this.gain1.gain.value = 0;
	    this.gain2.gain.value = 0;
	}
}

FX_Delay.prototype.set = function(val) {
	this.wet = val / 100.0;
    this.gain1.gain.value = this.wet * 0.25;
    this.gain2.gain.value = this.wet * 0.125;
};

FX_Delay.prototype.connect = function(next_node) {
	this.delay1.connect(next_node);
	this.delay2.connect(next_node);
};

FX_Delay.prototype.getnode1 = function() {
	return this.gain1;
};

FX_Delay.prototype.getnode2 = function() {
	return this.gain2;
};


///////////// FILTER /////////////////////
var CTL_Filter = function(ctx) {
	this.base_freq = 50;
	this.eg = 0;
	this.amount = 0.5;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
    this.lowpass = ctx.createBiquadFilter();
	this.lowpass.type = 0; // LPF
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
	this.lowpass.Q.value = 50 / 5;
};

CTL_Filter.prototype.set_on = function(val) {
	if (val > 0) {
	    this.set_amount(10);
	} else {
	    this.set_amount(0);
	}
}

/**
 * What type is f, could it be float and be sent from this new precision UI? - Miika L-M
 */
CTL_Filter.prototype.set_freq = function(f) {
	this.base_freq = f;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
};

CTL_Filter.prototype.set_q = function(q) {
	this.lowpass.Q.value = q / 5;
};

CTL_Filter.prototype.set_eg = function(val) {
	this.eg = val;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
};

CTL_Filter.prototype.set_amount = function(val) {
	this.amount = val / 100;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
};

CTL_Filter.prototype.connect = function(next_node) {
	this.lowpass.connect(next_node);
};

CTL_Filter.prototype.getnode = function() {
	return this.lowpass;
};


///////////// BITCRUSHER /////////////////////
var CTL_BitCrusher = function(ctx, eg) {
	this.effect = ctx.createJavaScriptNode(stream_length, 1, 1);
	this.max_depth = 0.5;	// 0.0 to 1.0		LFO max depth
	this.cur_depth = 0;		// 0.0 to max_depth	LFO current depth
	this.mix = 0.9;			// 0.0 to 1.0	mix balance of Dry/Wet
	this.step = 15;			// 2 to 100
	this.phase = 0;
	this.max_rate = ctx.sampleRate;
	this.sample_rate = 0.06;
	this.on = true;
	this.eg = eg;
	this.mode = EGM.Idle;

	var self = this;
	this.effect.onaudioprocess = function(event) {
		var Lin = event.inputBuffer.getChannelData(0);
		var Rin = event.inputBuffer.getChannelData(1);
		var Lout = event.outputBuffer.getChannelData(0);
		var Rout = event.outputBuffer.getChannelData(1);

		if (self.eg.mode != EGM.Idle)
			self.mode = EGM.Sustain;
		if ((self.on == false) || (self.mode == EGM.Idle)) {
			for (var i = 0; i < Lin.length; i++) {
				Rout[i] = Lout[i] = Lin[i];
			}
		} else {
			var step = self.step - (self.step * self.cur_depth) + 2;
			for (var i = 0; i < Lin.length; i++) {
				self.phase -= 1.0 / self.max_rate;
				if ((self.freq == 1.0) || (self.phase < 0)) {
					self.phase = 1.0 / (self.sample_rate * (self.max_rate - 1000) + 1000);
					self.val = Math.floor(Lin[i] * step) / step;
				}
				Rout[i] = Lout[i] = self.val + (Lin[i] - self.val) * (1 - self.mix);
			}
		}
		if (self.eg.mode == EGM.Idle)
			self.mode = EGM.Idle;
    };
};

CTL_BitCrusher.prototype.set_on = function(val) {
	this.on = val;
}

CTL_BitCrusher.prototype.set_depth = function(val) {
	// val; 0.0 to 1.0
	this.max_depth = val;
}

CTL_BitCrusher.prototype.set_cur_depth = function(val) {
	// val; 0.0 to 1.0
	// cur_depth: 0.0 to max_depth
	this.cur_depth = (val * 0.5 + 0.5) * this.max_depth;
}

CTL_BitCrusher.prototype.set_step = function(val) {
	// val; 2 to 100
	this.step = val;
}

CTL_BitCrusher.prototype.set_sample_rate = function(val) {
	// val; 0.0 to 1.0
	this.sample_rate = val;
}

CTL_BitCrusher.prototype.set_mix = function(val) {
	// val; 0.0 to 1.0
	this.mix = val;
}

CTL_BitCrusher.prototype.reset_phase = function() {
	this.phase = 0;
};

CTL_BitCrusher.prototype.connect = function(next_node) {
	this.effect.connect(next_node);
};

CTL_BitCrusher.prototype.getnode = function() {
	return this.effect;
};


///////////// SYNTH MAIN /////////////////////
var WebSynth = function() {

    this.context = new ( window.AudioContext || window.webkitAudioContext)();
    //this.context = window.getAC();
    console.log(this.context);
    this.root = this.context.createScriptProcessor(stream_length, 1, 2);
	this.vco1 = new VCO(this.context.sampleRate);
	this.vco2 = new VCO(this.context.sampleRate);
	this.eg = new EG();
	this.feg = new EG();

	this.filter = new CTL_Filter(this.context);
	this.volume = new CTL_Volume(this.context);
	this.delay = new FX_Delay(this.context);


	this.root.connect(this.filter.getnode());
	this.filter.connect(this.volume.getnode());
	this.volume.connect(this.context.destination);
	this.volume.connect(this.delay.getnode1()); //gets a gain node
	this.volume.connect(this.delay.getnode2());
	this.delay.connect(this.context.destination);

	//return this;
/*
	root -> filter -> volume -> dest
                             -> delay.node1 -> dest
                             -> delay.node2 -> dest
*/

};

WebSynth.prototype.play = function(n) {

	this.eg.note_on();
	this.feg.note_on();
    var f1 = Math.pow(2.0, (this.vco1.oct + n - 4 + this.vco1.fine) / 12.0);
    var f2 = Math.pow(2.0, (this.vco2.oct + n - 4 + this.vco2.fine) / 12.0);
	this.vco1.glide_init(f1);
	this.vco2.glide_init(f2);

	//What is the reason of this duplicate?
	var self = this;
    this.root.onaudioprocess = function(event) {
		self.filter.set_eg(self.feg.gain);
        var Lch = event.outputBuffer.getChannelData(0);
        var Rch = event.outputBuffer.getChannelData(1);
        var s1 = self.vco1.next(f1);
        var s2 = self.vco2.next(f2);
        var i;
		if (self.eg.mode == EGM.Idle) {
	        for (i = 0; i < Lch.length; i++) {
				Lch[i] = 0;
				Rch[i] = 0;
			}
		} else {
	        for (i = 0; i < Lch.length; i++) {
				Lch[i] = (s1[i] + s2[i]) * self.eg.gain;
				Rch[i] = Lch[i];
				self.eg.next();
				self.feg.next();
			}
		}
    };
};

WebSynth.prototype.stop = function() {
	this.eg.note_off();
	this.feg.note_off();
};


