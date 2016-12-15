/**
 * Created by Chamberlain on 14/12/2016.
 */
var app, server, express, __rootpath;

module.exports = function(NS) {
	app = NS.app;
	server = NS.server;
	express = NS.express;
	
	__rootpath = app.get('__rootpath');
	
	//At the very root, serve the pages & resources from the /dashboard-public/ folder.
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
