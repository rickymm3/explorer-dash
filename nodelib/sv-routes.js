/**
 * Created by Chamberlain on 14/12/2016.
 */
var app, server, express, __rootpath, __public, __projects, __private, __vuePartials;
const fs = require('fs');
const mkdirp = require('mkdirp');
const sockets = require('./sv-sockets');

module.exports = function(ERDS) {
	app = ERDS.app;
	server = ERDS.server;
	express = ERDS.express;
	__rootpath = app.get('__rootpath');
	__public = app.get('__public');
	__projects = app.get('__projects');
	__private = app.get('__private');
	
	//Create the /projects, /public and /.private folder in case it doesn't exists!
	mkdirp(__projects);
	mkdirp(__public);
	mkdirp(__private);
	
	var vuePartialTemplate = [
		'<!-- #$templateName -->',
		'<template id="$templateName-tmp">$code</template> '
	].join('\n');

	__vuePartials = __public + '/vue-partials';

	var defaultIndexPath = __public + '/index.html';

	function fetchVuePartials(params, cb) {
		if(!params) params = {};
		var indexPath = params.indexPath || defaultIndexPath;
		var partialPaths = params.partialPaths || [__vuePartials];
		var moreReps = params.moreReps || {};
		
		if(_.isString(partialPaths)) partialPaths = [partialPaths];
		
		var vuePartials = "";
		var indexHTML = ERDS.fileRead(indexPath);
		
		var count = partialPaths.length;
		function doNext() {
			if((--count) > 0) return;

			var replacements = _.assign({
				vuePartials: vuePartials,
				gitBranch: ERDS.git.branch,
				gitTag: ERDS.git.tag
			}, moreReps);
			
			cb(indexHTML.rep(replacements, true));
		}
		
		partialPaths.forEach(path => {
			if(!fs.existsSync(path)) {
				return doNext();
			}
			
			ERDS.filesCollect(path, ".html", (vueFiles) => {
				vueFiles = _.mapRename(vueFiles, fullpath => fullpath.split('/').pop().split('.')[0]);

				_.keys(vueFiles).forEach(templateName => {
					var code = vueFiles[templateName];
					vuePartials += vuePartialTemplate.rep({templateName: templateName, code: code}); //true
				});

				//vuePartials += "<!-- " + _.now() + " -->";

				doNext();
			});
		});
		
	}
	
	var prodCache = {};
	fetchVuePartials(null, newIndexHTML => {
		prodCache['/'] = newIndexHTML;
	});
	
	//At the very root, serve the pages & resources from the /dashboard-public/ folder.
	app.get('/', function (req, res, next) {
		if(req.url=='/') {
			if(ERDS.isDev) {
				//This can be cached later on production, but for testing let's recache it:
				//traceClear();
				trace("Refreshing cache...".yellow);
				return fetchVuePartials(null, output => res.send(output));
			} else {
				return res.send(prodCache['/']);
			}
		}
		
		next();
	});
	
	app.use('/', express.static(ERDS.__public));
	
	//Share some of the Node JS code with Browser in /js/ URL so it can benefit from a few shortcut functions:
	app.use('/js', express.static(__rootpath + "/nodelib/common"));
	
	app.use('/p/:projectName', function(req, res, next) {
		var projectName = req.params.projectName;
		if(req.url!=="/") return next();
		
		ERDS.getProjectData(projectName, (err, proj) => {
			if(err) return next();
			
			//proj.indexPath...
			trace("Refreshing cache...".yellow);
			fetchVuePartials({
				partialPaths: [proj.vuePartials, __vuePartials],
				moreReps: {
					projectName: proj.projectName,
					projectClass: proj.projectName + ' project',
					projectScripts: ERDS.createScriptTags(proj.projectScripts)
				}
			}, output => res.send(output));
		});
	});

	//Project specific:
	app.use('/p/:projectName/*', function (req, res, next) {
		var projectName = req.params.projectName;
		var projectPath = ERDS.__projects + "/" + projectName;
		var projectURI = '/p/'+projectName;
		var resourcePath = req.originalUrl.split(projectURI)[1];
		//trace(resourcePath);
		res.sendFile(projectPath + resourcePath);
		//return ;
	});
	
	/**/
	//app.get('/p', express.static(__rootpath + "/public"));

	app.on('error', function(err) {
		trace("Error!".red);
	});
};

