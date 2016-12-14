var _global;
if(isNode()) _global = global;
else _global = window;

_global.trace = console.log.bind(console);

String.prototype.contains = function contains(str) {
	return this.indexOf(str)>-1;
};

String.prototype.rep = function rep(obj) {
	var str = this.toString();
	for(var o in obj) {
		var regex = new RegExp("\\$"+o, "g");
		str = str.replace(regex, obj[o]);
	}
	
	return str;
};

String.prototype.fixSlashes = function() {
	var str = this.toString().replace(/\\/g, "/");
	return __.endsWith(str, "/") ? str : str + "/";
};


function isNode() {
	return typeof module !== 'undefined' && module.exports;
}