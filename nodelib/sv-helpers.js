/**
 * Created by Chamberlain on 14/12/2016.
 */
const fs = require('fs');
const path = require('path');
const FILE_ENCODING = {encoding: 'utf8'};

module.exports = function(ERDS) {

	ERDS.isDir = function isDir(path) {
		var stat = fs.statSync(path);
		return stat.isDirectory();
	};
	
	ERDS.filesFilter = function(dir, filterFunc, isRecursive) {
		if(!dir || !filterFunc) return [];
		if(isRecursive==null) isRecursive = true;
		
		//filterFunc could also be an *.extension
		if(_.isString(filterFunc)) {
			var str = filterFunc;
			filterFunc = file => file.endsWith(str);
		}
		
		dir = dir.fixSlashes();

		var found = [];
		
		function _readDir(subdir) {
			var files = fs.readdirSync(subdir);

			files.forEach(file => {
				var fullpath = path.resolve(subdir + '/' + file).fixSlashes();
				
				if(ERDS.isDir(fullpath)) {
					isRecursive && _readDir(fullpath);
					return;
				}

				if(filterFunc(file, fullpath)) {
					found.push(fullpath);
				}
			});

		} _readDir(dir);

		return found;
	};
	
	ERDS.getDirs = function(dir, cb) {
		dir = dir.fixSlashes();
		
		fs.readdir(dir, (err, files) => {
			var dirs = files.filter(file => ERDS.isDir(dir+'/'+file));
			cb(dirs);
		});
	};
	
	ERDS.filesCollect = function(dir, filterFunc, cb, isRecursive) {
		if(!cb) throw new Error("filesCollect needs a callback function!");

		//filterFunc could also be an *.extension
		if(_.isString(filterFunc)) {
			var str = filterFunc;
			filterFunc = file => file.endsWith(str);
		}
		
		
		var files = ERDS.filesFilter(dir, filterFunc, isRecursive);
		var obj = {};
		var f = files.length;

		files.forEach(fullpath => ERDS.fileRead(fullpath, mergeFileContent));
		
		function mergeFileContent(err, content, fullpath) {
			if(err) throw err;
			
			obj[fullpath] = content;
			
			if(--f<=0) {
				cb(obj);
			}
		}
	};
	
	ERDS.fileRead = function(file, cb) {
		if(cb==null) return fs.readFileSync(file, FILE_ENCODING);

		fs.readFile(file, FILE_ENCODING, (err, content) => {
			cb(err, content, file);
		});
	};
	
	ERDS.createScriptTags = function(scriptsURLs) {
		return scriptsURLs.map(url => '<script src="$0"></script>'.rep([url]));
	}
};