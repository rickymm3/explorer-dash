var GLOBALS;
if(isNode()) GLOBALS = global;
else {
	GLOBALS = window;
	if(!GLOBALS.console) GLOBALS.console = {log: function() {}};
}

function isNode() {
	return typeof module !== 'undefined' && module.exports;
}

String.prototype.has = function has(str) {
	return this.indexOf(str)>-1;
};


String.prototype.rep = function rep(obj) {
	var regex, str = this.toString();
	
	if(_.isArray(obj)) {
		for(var i=obj.length; --i>=0;) {
			regex = new RegExp("\\$"+i, "g");
			str = str.replace(regex, obj[i]);
		}
	} else {
		for(var o in obj) {
			regex = new RegExp("\\$"+o, "g");
			str = str.replace(regex, obj[o]);
		}
	}

	return str;
};

String.prototype.fixSlashes = function() {
	var str = this.toString().replace(/\\/g, "/");
	return str.endsWith("/") ? str.substr(0,str.length-1) : str;
};

"".endsWith || (function() {
	String.prototype.endsWith = function(searchString, position) {
		var subjectString = this.toString();
		if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
			position = subjectString.length;
		}
		position -= searchString.length;
		var lastIndex = subjectString.lastIndexOf(searchString, position);
		return lastIndex !== -1 && lastIndex === position;
	};
})();

String.prototype.camelToTitleCase = function() {
	var text = this.toString();
	var result = text.replace( /([A-Z])/g, " $1" );
	return result.charAt(0).toUpperCase() + result.slice(1);
};

Function.prototype.defer = function() {
	var _this = this, args = arguments;
	_.defer(function() { _this.apply(null, args); });
};

//////////////////////////////////////////////////////////////

_.isTruthy = function(bool) {
	return bool===true || "true,1,on,yes".has(bool);
};

_.mapRename = function(obj, filter) {
	var newObj = {};
	_.mapObject(obj, (val, key) => {
		newObj[filter(key)] = val;
	});
	return newObj;
};

//////////////////////////////////////////////////////////////

GLOBALS.trace = console.log.bind(console);
GLOBALS.traceObj = function(o) {
	var output = _.keys(o);
	trace(output);
	return output;
};

if(isNode()) {
	GLOBALS.traceClear = function() { process.stdout.write('\033c'); };
	GLOBALS.traceError = function(err) { trace(err.toString().red); };
} else {
	GLOBALS.traceClear = function() { console.clear && console.clear(); };
	GLOBALS.traceError = function(err) { console.error(err); };
}