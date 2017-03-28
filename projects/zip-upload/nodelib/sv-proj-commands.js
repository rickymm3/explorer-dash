const formidable = require('formidable');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const JSZip = require("jszip");


/**
 * Created by Chamberlain on 27/03/2017.
 */
module.exports = function(PROJ) {
	//trace("ZIP-Upload Project!");

	var ERDS = PROJ.ERDS;
	var app = ERDS.app;

	var __projData = require(PROJ.__json.replace('.json', '.js'));
	var __temp = PROJ.__data + '/temp';
	var __req = null;
	var __res = null;
	var __proj = null;
	var __file = null;
	var __json = null;
	var __zip = null;
	var __targetPath = null;

	mkdirp(__temp);

	var errorHeader = "ZIP-Upload POST: ";
	function status500(msg) {
		__res.status(500).send(errorHeader + msg);
	}

	app.post(`/zip-upload-transfer`, function(req, res, next) {
		__req = req;
		__res = res;
		var query = req.query;
		var id = query.proj;
		if(id<0 || !__projData || !__projData.projects || id>=__projData.projects.length) {
			return status500('The Project ID is not found or unavailable: ' + id);
		}

		//Set the current project details (to know where to move the ZIP's content to)
		__proj = __projData.projects[id];
		__targetPath = path.resolve(__proj.path).fixSlashes();

		var form = new formidable.IncomingForm();

		form.multiples = false; //Limit to 1 single ZIP file.
		form.uploadDir = __temp;
		form.keepExtensions = true;
		form.maxFieldsSize = 5 * 1024 * 1024; //5MB limit

		//form.encoding = "utf-8";

		// every time a file has been uploaded successfully,
		// rename it to it's orignal name
		form.on('file', function(field, file) {
			if(!file.name.endsWith('.zip')) {
				status500('Only ZIPs are accepted!');
				fs.unlink(file.path);
				return;
			}

			__file = file;
		});

		// log any errors that occur
		form.on('error', function(err) {
			status500("An error occured in the form parsing - " + err.toString());
		});

		// once all the files have been uploaded, send a response to the client
		form.on('end', function() {
			onZipReadyToProcess(form, __file);
		});

		// parse the incoming request containing the form data
		form.parse(req);
	});

	app.use('/zip-upload-confirm', function(req, res, next) {
		__req = req;
		__res = res;
		var action = req.query.action;

		if(!__zip) return status500("There is no active ZIP!");
		if(!action) return status500("Must supply an action!");
		if(!CONFIRM_ACTIONS[action]) return status500("Unknown action: " + action);

		CONFIRM_ACTIONS[action](() => {
			res.end('Finished Confirm Action');
		});
	});


	function onZipReadyToProcess(form, file) {
		trace(`FileSize of "${file.name}": ` + (file.size / 1024).toFixed(2) + "KB");
		var fileNewName = path.join(form.uploadDir, file.name);
		fs.rename(file.path, fileNewName);

		var zip = __zip = new JSZip();

		if(!ERDS.fileExists(__targetPath)) {
			return status500("The target directory for the ZIP does NOT exists! " + __proj.path);
		}

		var targetFiles = ERDS.filesFilter(__targetPath, () => true, true);

		targetFiles = targetFiles.map( file => file.replace(__targetPath,''));

		fs.readFile(fileNewName, (err, data) => {
			if(err) return status500(err);

			trace("Read file: " + fileNewName);
			zip.loadAsync(data).then(onZIPLoaded).catch(function(reason) {
				return status500('Unable to load ZIP! ' + reason);
			});
		});

		function onZIPLoaded(zip) {
			var fileNames = _.keys(zip.files);
			var folderNames = [];
			var hasRootFiles = false;

			fileNames.forEach(file => {
				var split = file.split('/');
				var first = split[0];
				if(first.has('.')) {
					hasRootFiles = true;
					return;
				}

				if(folderNames.has(first)) return;

				folderNames.push(first);
			});

			var hasRootFolder = !hasRootFiles && folderNames.length==1;

			__json = {
				projectName: __proj.name,
				index: 0,
				fileNames: fileNames,
				hasRootFiles: hasRootFiles,
				rootFolder: hasRootFolder ? folderNames[0] : null,
				target: {
					fileNames: targetFiles
				}
			};

			trace(folderNames);

			//zip.forEach(function (relativePath, file){
			//	trace("iterating over: ".green +  relativePath + " : " + typeof(file));
			//});

			__res.end(JSON.stringify(__json));
		}
	}

	var CONFIRM_ACTIONS = {
		copyRoot(next) {
			CONFIRM_ACTIONS.copyAsIs(next, __json.rootFolder);
		},

		copyAsIs(next, root) {
			var targetDir = __targetPath;
			if(!root && !targetDir.endsWith('/')) targetDir += "/";

			function extractNext(i) {
				if(i>=__json.fileNames.length) return next();

				var zipFilename = __json.fileNames[i];
				var targetFilename =  targetDir + (root ? zipFilename.replace(root,'') : zipFilename);

				__zip.files[zipFilename].async('nodebuffer').then((buff) => {
					if(!targetFilename.has('.')) {
						return mkdirp(targetFilename, function(err) {
							if(err) throw err;

							extractNext(i+1);
						});
					}

					trace("Writing: " + targetFilename);

					fs.writeFile(targetFilename, buff);
					extractNext(i+1);
				});
			}

			extractNext(0);
		},

		clearTarget(next) {
			var targetDir = __targetPath;
			if(!targetDir.endsWith('/')) targetDir += "/";
			//__targetPath
			//var count = __json.target.fileNames.length;
			try {
				var allTargetFiles = ERDS.filesFilter(__targetPath, () => true);
				allTargetFiles.forEach( targetName => {
					if(!ERDS.fileExists(targetName)) return;
					trace("Removing: " + targetName);
					fs.unlink(targetName);
				});

				ERDS.getDirs(__targetPath, myDirs => {
					myDirs.forEach(dir => {
						dir = targetDir + dir;
						trace("Removing dir: " + dir);
						fs.rmdir(dir);
					});
				});

			} catch(err) {
				status500('Unable to clear target folder!');
			}

			next();
		}
	}
};