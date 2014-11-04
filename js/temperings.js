/**
 * 12 EDO algorithm
 * \sqrt[12]{2}=2^{\frac{1}{12}}\approx 1.059463
 *
 * Calculating absolute freqs, piano
 * P_n=P_a(\sqrt[12]{2})^{(n-a)}
 * 
 * Example:
 * P_{40}=440(\sqrt[12]{2})^{(40-49)}\approx 261.626~\text{Hz}
 *
 * (Wikipedia)
 */



var tprColl = new Collection();
tprColl.add('Lo Shu Natural', 'loshunatural');
tprColl.add('Cuberoot', 'cubicroot');
tprColl.add('12-EDO', 'EDO12');
//tprColl.add('Stockhausen 5:1 (tba)', 'function');
//tprColl.add('Pythagorean (tba)', 'function');
//tprColl.add('Kirnberger III (tba)', 'function');

function getTemperingCollection() {
	return tprColl;
}

var loshunatural = function loshunatural() {

	var octaveRange = [1, 999]; // || 1000?
	var toneSteps	= 100;

	//return WHAT
}

var cubicroot = function cubicroot() {

	var octaveRange = [1, 999]; // || 1000?
	var toneSteps	= 100;

	//return WHAT
}

var EDO12 = function EDO12() {

	var octaveRange = [1, 111]; // Z doubles
	var toneSteps	= 12;

	//return WHAT
}

/**
 * Custom Equally Detuned Octave
 * 
 * @param {[type]} n How many notes in one octave
 * @param {[type]} p Range of one octave
 * @param {[type]} f Grid element #freq text
 */
var EDOn = function EDOn(n, p, f){

	var tFreq;


	return tFreq;
}

/**/