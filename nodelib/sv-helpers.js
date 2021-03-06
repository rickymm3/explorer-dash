/**
 * Created by Chamberlain on 14/12/2016.
 */
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const dateFormat = require('dateformat');
const FILE_ENCODING = {encoding: 'utf8'};
const url = require('url');

module.exports = function($$$) {

	//////////////////////////////////////////// File & Directory Helpers:

	$$$.fullUrl = function(req) {
		return url.format({
			protocol: req.protocol,
			host: req.get('host'),
			pathname: req.originalUrl
		});
	};

	$$$.isDir = function isDir(path) {
		var stat = fs.statSync(path);
		return stat.isDirectory();
	};

	$$$.getDirs = function(dir, cb) {
		dir = dir.fixSlashes();

		fs.readdir(dir, (err, files) => {
			var dirs = files.filter(file => $$$.isDir(dir+'/'+file));
			cb(dirs);
		});
	};
	
	$$$.makeDir = function(path, cb) {
		path = path.fixSlashes();
		var pathArr = path.split('/');
		var ending = pathArr.last();
		
		if(ending.has('.')) {
			pathArr.pop();
		}
		
		path = pathArr.join('/');
		mkdirp(path, cb);
	};
	
	$$$.fileBackup = function(path, isOverwrite, cb) {
		if(_.isFunction(isOverwrite)) {
			cb = isOverwrite;
			isOverwrite = false;
		}
		
		//First backup the file:
		fs.copy(path, path + '.bak', {overwrite: isOverwrite, errorOnExists: true}, cb);
	};
	
	$$$.safeBackup = function(path, isOverwrite, cb) {
		$$$.fileBackup(path, isOverwrite, (err) => {
			if(err) return cb(err);
			
			fs.remove(path, cb);
		});
	};
	
	$$$.fileRename = function(path, path2, cb) {
		fs.move(path, path2,  {overwrite: true}, cb);
	};

	$$$.fileCopyNow = function(path, cb) {
		var pathinfo = path.toPath();
		var pathCopy = pathinfo.path +
			pathinfo.filename +
			dateFormat(new Date(), ".yy-mm-dd.HH_MM").replace('_','h') + //-ss
			pathinfo.ext;
		fs.copy(path, pathCopy, cb);
	};

	$$$.fileCopy = function(path, pathNew, cb) {
		var pathinfo = path.toPath();
		fs.copy(path, pathNew, cb);
	};

	$$$.fileExists = function(dirOrFile) {
		return fs.existsSync(dirOrFile);
	};
	
	$$$.filesFilter = function(dir, filterFunc, isRecursive) {
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
				
				if($$$.isDir(fullpath)) {
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
	
	$$$.filesMerge = function(dir, filterFunc, isRecursive, cb) {
		if(!cb) throw new Error("filesMerge needs a callback function!");

		//filterFunc could also be an *.extension
		if(_.isString(filterFunc)) {
			var str = filterFunc;
			filterFunc = file => file.endsWith(str);
		}
		
		
		var files = $$$.filesFilter(dir, filterFunc, isRecursive);
		var obj = {};
		var f = files.length;

		files.forEach(fullpath => $$$.fileRead(fullpath, mergeFileContent));
		
		function mergeFileContent(err, content, fullpath) {
			if(err) throw err;
			
			obj[fullpath] = content;
			
			if(--f<=0) {
				cb(obj);
			}
		}
	};

	$$$.fileRead = function(file, cb) {
		if(cb==null) return fs.readFileSync(file, FILE_ENCODING);

		fs.readFile(file, FILE_ENCODING, (err, content) => {
			cb(err, content, file);
		});
	};

	$$$.fileWrite = function(file, content, cb) {
		if(cb==null) return fs.writeFileSync(file, content, FILE_ENCODING);

		fs.writeFile(file, content, FILE_ENCODING, (err) => {
			cb(err, file);
		});
	};

	$$$.jsonRead = function(file, cb) {
		if(!cb) return JSON.parse($$$.fileRead(file));
		$$$.fileRead(file, (err, content, file) => {
			cb(err, JSON.parse(content), file);
		});
	};

	$$$.jsonWrite = function(file, content, cb) {
		var prettyJSON = typeof(content)=="string" ? content : JSON.stringify(content, null, true);

		$$$.fileWrite(file, prettyJSON, cb);
	};

	//////////////////////////////////////////// HTML Helpers:
	
	$$$.createScriptTags = function(URLs) {
		return URLs.map(url => '<script src="$0"></script>'.rep([url]));
	}

	$$$.createCSSTags = function(URLs) {
		return URLs.map(url => '<link rel="stylesheet" href="$0">'.rep([url]));
	};

	//////////////////////////////////////////// Require & Module Helpers:

	$$$.loadModules = function(dir, NS, reload, expr) {
		if(!expr) expr = /\.*\.js/;

		var svScripts = $$$.filesFilter(dir, (file, full) => expr.test(file));

		if(!svScripts || !svScripts.length) {
			return traceError("Could not find modules in: " + dir);
		}

		svScripts.forEach( mod => {
			if($$$.isModuleLoaded(mod)) {
				if(!reload) return;
				
				if($$$.isDev) {
					require('decache')(mod);
				}
			}

			require(mod)(NS);
		} );
	};

	$$$.isModuleLoaded = function(modName) {
		return !!require.cache[require.resolve(modName)];
	};

	var _invalidateRequireCacheForFile = function(filePath){
		delete require.cache[require.resolve(filePath)];
	};

	$$$.requireNoCache =  function(filePath){
		_invalidateRequireCacheForFile(filePath);
		return require(filePath);
	};

	$$$.hideProperties = function(obj, prop) {
		var props = prop.split(',');

		props.forEach( (prop) => {
			Object.defineProperty(obj, prop.trim(), {
				enumerable: false,
				writable: true
			});
		});
	}
};