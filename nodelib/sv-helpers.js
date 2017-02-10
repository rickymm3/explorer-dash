/**
 * Created by Chamberlain on 14/12/2016.
 */
const fs = require('fs');
const mkdirp = require('mkdirp');
const decache = require('decache');
const path = require('path');
const FILE_ENCODING = {encoding: 'utf8'};

module.exports = function(ERDS) {

	//////////////////////////////////////////// File & Directory Helpers:

	ERDS.isDir = function isDir(path) {
		var stat = fs.statSync(path);
		return stat.isDirectory();
	};

	ERDS.getDirs = function(dir, cb) {
		dir = dir.fixSlashes();

		fs.readdir(dir, (err, files) => {
			var dirs = files.filter(file => ERDS.isDir(dir+'/'+file));
			cb(dirs);
		});
	};
	
	ERDS.makeDir = function(path, cb) {
		path = path.fixSlashes();
		var pathArr = path.split('/');
		var ending = pathArr.last();
		
		if(ending.has('.')) {
			pathArr.pop();
		}
		
		path = pathArr.join('/');
		mkdirp(path, cb);
	};

	ERDS.fileExists = function(dirOrFile) {
		return fs.existsSync(dirOrFile);
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
	
	ERDS.filesMerge = function(dir, filterFunc, isRecursive, cb) {
		if(!cb) throw new Error("filesMerge needs a callback function!");

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

	ERDS.fileWrite = function(file, content, cb) {
		if(cb==null) return fs.writeFileSync(file, content, FILE_ENCODING);

		fs.writeFile(file, content, FILE_ENCODING, (err) => {
			cb(err, file);
		});
	};

	//////////////////////////////////////////// HTML Helpers:
	
	ERDS.createScriptTags = function(URLs) {
		return URLs.map(url => '<script src="$0"></script>'.rep([url]));
	}

	ERDS.createCSSTags = function(URLs) {
		return URLs.map(url => '<link rel="stylesheet" href="$0">'.rep([url]));
	};

	//////////////////////////////////////////// Require & Module Helpers:

	ERDS.loadModules = function(dir, NS, reload, expr) {
		if(!expr) expr = /\.*\.js/;

		var svScripts = ERDS.filesFilter(dir, (file, full) => expr.test(file));

		if(!svScripts || !svScripts.length) {
			return traceError("Could not find modules in: " + dir);
		}

		svScripts.forEach( mod => {
			if(ERDS.isModuleLoaded(mod)) {
				if(!reload) return;

				decache(mod);
			}

			require(mod)(NS);
		} );
	};

	ERDS.isModuleLoaded = function(modName) {
		return !!require.cache[require.resolve(modName)];
	}
};