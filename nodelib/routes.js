/**
 * Created by Chamberlain on 14/12/2016.
 */
var app, server, express, __rootpath, __public, __projects, __private;
const mkdirp = require('mkdirp');
const sockets = require('./sockets');

module.exports = function(ERDS) {
	app = ERDS.app;
	server = ERDS.server;
	express = ERDS.express;
	__rootpath = app.get('__rootpath');
	__public = app.get('__public');
	__projects = app.get('__projects');
	__private = app.get('__private');
	
	
	//Create the /projects and /.private folder in case it doesn't exists!
	mkdirp(__projects);
	mkdirp(__private);
	
	var vuePartialTemplate = '\n<!-- #$templateName -->\n<template id="$templateName-tmp">$code</template> \n';
	var __vuePartials = __public + '/vue-partials';
	var indexHTML;
	
	function cacheVueTemplates(cb) {
		var vuePartials = "";
		indexHTML = ERDS.fileRead(__public + '/index.html');
		ERDS.filesCollect(__vuePartials, ".html", (vueFiles) => {
			vueFiles = _.mapRename(vueFiles, fullpath => fullpath.split('/').pop().split('.')[0]);

			_.keys(vueFiles).forEach(templateName => {
				var code = vueFiles[templateName];
				vuePartials += vuePartialTemplate.rep({templateName: templateName, code: code});
			});

			//vuePartials += "<!-- " + _.now() + " -->";
			
			cb(indexHTML.rep({
				vuePartials: vuePartials,
				gitBranch: ERDS.git.branch,
				gitTag: ERDS.git.tag
			}));
		});
	}
	
	var prodIndexHTML;
	cacheVueTemplates(newIndexHTML => { prodIndexHTML = newIndexHTML; });
	
	//At the very root, serve the pages & resources from the /dashboard-public/ folder.
	app.use('/', function (req, res, next) {
		if(req.url=='/') {
			if(ERDS.isDev) {
				//This can be cached later on production, but for testing let's recache it:
				trace("Using DEV refreshed index.html...");
				return cacheVueTemplates(newIndexHTML => res.send(newIndexHTML));
			} else {
				return res.send(prodIndexHTML);
			}
		}
		//traceObj(req);
		
		next();
	});
	
	app.use('/', express.static(__rootpath + "/public"));
	
	//Share some of the Node JS code with Browser in /js/ URL so it can benefit from a few shortcut functions:
	app.use('/js', express.static(__rootpath + "/nodelib/common"));
	
	//Project specific:
	app.use('/p/:projectName', function(req, res, next) {
		var projectName = req.params.projectName;
		res.send("Project name is: " + projectName);
		
		next();
	});

	app.on('error', function(err) {
		trace("Error!".red);
	});
};

