/**
 * Created by Chamberlain on 14/12/2016.
 */
var app, server, express, __rootpath, __public;

module.exports = function(NS) {
	app = NS.app;
	server = NS.server;
	express = NS.express;
	__rootpath = app.get('__rootpath');
	__public = app.get('__public');

	var vuePartialTemplate = '\n<!-- #$templateName -->\n<template id="tmp-$templateName">$code</template> \n';
	var __vuePartials = __public + '/vue-partials';
	var indexHTML = ERDS.fileRead(__public + '/index.html');
	
	function cacheVueTemplates(cb) {
		var vuePartials = "";

		ERDS.filesCollect(__vuePartials, ".html", (vueFiles) => {
			vueFiles = _.mapRename(vueFiles, fullpath => fullpath.split('/').pop().split('.')[0]);

			_.keys(vueFiles).forEach(templateName => {
				var code = vueFiles[templateName];
				vuePartials += vuePartialTemplate.rep({templateName: templateName, code: code});
			});

			//vuePartials += "<!-- " + _.now() + " -->";
			
			cb(indexHTML.rep({vuePartials: vuePartials}));
		});
	}
	
	//At the very root, serve the pages & resources from the /dashboard-public/ folder.
	app.use('/', function (req, res, next) {
		if(req.url=='/') {
			return cacheVueTemplates(newIndexHTML => res.send(newIndexHTML));
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

