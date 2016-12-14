/**
 * Created by Chamberlain on 14/12/2016.
 */
const fs = require('fs');
const path = require('path');


module.exports = function(NS) {

	NS.isDir = function isDir(path) {
		var stat = fs.statSync(path);
		return stat.isDirectory();
	};
	
	NS.filesFilter = function filesFilter(dir, filterFunc, isRecursive) {
		if(!dir || !filterFunc) return [];
		if(isRecursive==null) isRecursive = true;
		
		dir = dir.fixSlashes();

		var found = [];
		
		function _readDir(subdir) {
			var files = fs.readdirSync(subdir);

			files.forEach(file => {
				var fullpath = path.resolve(subdir + '/' + file).fixSlashes();

				if(NS.isDir(fullpath)) {
					isRecursive && _readDir(fullpath);
					return;
				}

				if(filterFunc(file, fullpath)) {
					found.push(fullpath);
				}
			});

		} _readDir(dir);

		return found;
	}
};