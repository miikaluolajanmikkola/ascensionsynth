/**
 * Keyboard collections
 * 
 * Written by Miika Luolajan-Mikkola, 2014
 */


/**
 * This forces event.which mapping to keys, which are needed to build meaningful Keyboard Collections.
 * All scandics might not work, test! This could be far from a perfect mapper.
 * @type {Object}
 */
var kbEventNumber = {
	'32' : 'space;',
	'192' : '§',
	'49' : '1',
	'50' : '2',
	'51' : '3',
	'52' : '4',
	'53' : '5',
	'54' : '6',
	'55' : '7',
	'56' : '8',
	'57' : '9',
	'48' : '0',
	'187' : '+',
	'187' : "\'",
	'81' : 'q',
	'87' : 'w',
	'69' : 'e',
	'82' : 'r',
	'84' : 't',
	'89' : 'y',
	'85' : 'u',
	'73' : 'i',
	'79' : 'o',
	'80' : 'p',
	'219' : 'å',
	'221' : '¨',
	'65' : 'a',
	'83' : 's',
	'68' : 'd',
	'70' : 'f',
	'71' : 'g',
	'72' : 'h',
	'74' : 'j',
	'75' : 'k',
	'76' : 'l',
	'186' : 'ö',
	'222' : 'ä',
	'222' : "\'",
	'188' : '<',
	'90' : 'z',
	'88' : 'x',
	'67' : 'c',
	'86' : 'v',
	'66' : 'b',
	'78' : 'n',
	'77' : 'm',
	'188' : ',',
	'190' : '.',
	'189' : '-'
};

var kbCollection = new Collection();

var kbZenOvertones = {
	'space' : 999,
	'<' : 111, 
	'a' : 147,
	's' : 258,
	'd' : 369,
	'f' : 471,
	'g' : 582,
	'h' : 693,
	'q' : 174,
	'w' : 285,
	'e' : 396,
	'j' : 417,
	'k' : 528,
	'l' : 639,
	'ö' : 741,
	'ä' : 852,
	'å' : 963,
	'y' : 714,
	'u' : 825,
	'i' : 936,
	'o' : 987,
	'1' : 111,
	'2' : 222,
	'3' : 333,
	'4' : 444,
	'5' : 555,
	'6' : 666,
	'7' : 777,
	'8' : 888,
	'9' : 999,
	'z' : 198,
	'x' : 285,
	'c' : 372,
	'v' : 468,
	'b' : 555,
	'n' : 642,
	'm' : 738,
	',' : 825,
	'.' : 912
};
kbCollection.add('ZenOvertones', kbZenOvertones);

var kbChronoHoly = {
	'a' : 111, 
	'w' : 147,
	's' : 174,
	'e' : 258,
	'd' : 285,
	'r' : 369,
	'f' : 396,
	't' : 417,
	'g' : 471,
	'y' : 528,
	'h' : 582,
	'u' : 639,
	'j' : 693,
	'i' : 714,
	'k' : 741,
	'o' : 825,
	'l' : 852,
	'p' : 936,
	'ö' : 963,
	'å' : 987,
	'1' : 111,
	'2' : 222,
	'3' : 333,
	'4' : 444,
	'5' : 555,
	'6' : 666,
	'7' : 777,
	'8' : 888,
	'9' : 999,
	'<' : 7.83,
	'z' : 63.05,
	'x' : 136.1
};
kbCollection.add('ChronoHoly', kbChronoHoly);

var kbPiano = {
	'a' : 111,
	's' : 111,
	'e' : 111,
	'd' : 321,
	'r' : 111,
	'f' : 111,
	't' : 369,
	'g' : 111,
	'y' : 111,
	'h' : 432,
	'u' : 456,
	'j' : 483,
	'k' : 516,
	'l' : 555,
	'p' : 111,
	'ö' : 111,
	'å' : 111,
	'ä' : 111
};
kbCollection.add('Piano (H=A432)', kbPiano);

var kbUtremifa = {
	's' : 396,
	'd' : 417,
	'f' : 528,
	'j' : 639,
	'k' : 741,
	'l' : 852
};
kbCollection.add('Utremifa', kbUtremifa);

var kbPenta432 = {
	'<' : 111,
	'a' : 219,
	's' : 273,
	'd' : 321,
	'f' : 432,
	'j' : 555,
	'k' : 666,
	'l' : 792,
	'ö' : 888,
	'ä' : 987
};
kbCollection.add('Penta432', kbPenta432);

function getKeyboardCollection() {

	return kbCollection;
}




