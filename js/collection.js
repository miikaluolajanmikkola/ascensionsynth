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
/*
var myCol = new Collection();
myCol.add( "A", [1, 4, 7]);
myCol.add( "B", [3, 5, 6]);
myCol.add( "C", [6, 8, 9]);
console.log(myCol);
*/