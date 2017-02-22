/**
 * Created by chamberlainpi on 2017-02-06.
 */

module.exports = function(ERDS) {
	const projectsUtils = require('./sv-projects')(ERDS);
	const fs = require('fs');
	const app = ERDS.app;
	const express = ERDS.express;
	const errorHeader = '<h1>Something broke!</h1><br/>';

	function status500(res, msg) {
		res.status(500).send(errorHeader + msg);
	}
	
	app.use('/test', express.static(ERDS.__test));
	app.use('/', preprocessIndexHTML);
	app.use('/', express.static(ERDS.__public));
	app.use('/js', express.static(ERDS.__common));
	app.use('/p/:project/js', serveStaticProjectFiles);
	app.use('/p/:project/css', serveStaticProjectFiles);
	app.use('/p/:project/json', serveProjectJSON);
	app.use('/p/:project', preprocessProject);

	//Error Handler:
	app.use(function(err, req, res, next) {
		if(err) {
			traceError(err);
		}

		status500(res, err.message);
	});

	var cache = {
		'/': getCachedRoot()
	};

	function getCachedRoot() {
		var siteReps = {
			gitInfo: 'Last Updated: <i class="git-date">$2</i> <i class="git-hash">($0 : $1)</i>'.rep([ERDS.git.branch, ERDS.git.short, ERDS.git.date])
		};

		return ERDS.fileRead(ERDS.__indexhtml).rep(siteReps);
	}

	function getCached(address) {
		if(!address) {
			if(ERDS.isDev) {
				return getCachedRoot();
			}
			return cache['/'];
		}

		if(!cache[address] || ERDS.isDev) {
			cache[address] = ERDS.fileRead(address);
		}
		return cache[address];
	}

	function preprocessIndexHTML(req, res, next) {
		if(req.url!="/") return next();

		ERDS.getDirs(ERDS.__projects, (dirs) => {
			var projectLinks = dirs
				.map( d => {
					return '<a href="/p/$0">$1</a>'.rep([d, d]);
				})
				.join('\n');

			res.send(getCached().rep({
				pageHTML: projectLinks,
				pageCSS: '',
				pageJS: '',
				projectName: ''
			}));
		});
	}

	function preprocessProject(req, res, next) {
		var proj = projectsUtils.getProjectObj(req.params.project);
		if(!proj) return next();

		if(!ERDS.fileExists(proj.__indexhtml)) {
			traceError("Project Index missing");
			return next();
		}

		var projectHTML = getCached(proj.__indexhtml);
		var projectCSS = ERDS.createCSSTags([
			'/p/'+proj.name+'/css/project.css'
		]).join('\n');

		var projectJS = ERDS.createScriptTags([
			'/p/'+proj.name+'/js/project.js'
		]).join('\n');

		res.send(getCached().rep({
			pageHTML: projectHTML,
			pageCSS: projectCSS,
			pageJS: projectJS,
			projectName: proj.name
		}));
	}

	function serveStaticProjectFiles(req, res, next) {
		var proj = projectsUtils.getProjectObj(req.params.project);
		if(!proj) return next();

		var url = req.originalUrl;
		var matches = url.match(/\/(js|css)\//);

		if(matches && matches.index>-1) {
			var urlEnd = url.substr(matches.index);
			var urlFile = proj.__path + urlEnd;

			if(!ERDS.fileExists(urlFile)) {
				return status500(res, 'Missing File: ' + urlEnd);
			}

			return res.sendFile(urlFile);
		}

		next();
	}
	
	function serveProjectJSON(req, res, next) {
		var projectName = req.params.project;
		var proj = projectsUtils.getProjectObj(projectName);
		if(!proj) return status500(res, "Requested JSON of unknown project: " + projectName);
		
		switch(req.method) {
			case 'PUT':
			case 'POST':
			case 'GET':
				res.set({ 'content-type': 'application/json; charset=utf-8' });
				if(!ERDS.fileExists(proj.__json)) {
					return res.send({error: 'missing file'});
				}
				
				ERDS.fileRead(proj.__json, (err, content) => {
					if(err) return status500(res, 'Error while reading the JSON file.');
					return res.send(content);
				});
				
				break;
			
			default: status500(res, 'Unhandled JSON HTTP method: ' + req.method);	
		}
	}
};