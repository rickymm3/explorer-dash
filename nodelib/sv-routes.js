/**
 * Created by chamberlainpi on 2017-02-06.
 */

module.exports = function($$$) {
	const projectsUtils = require('./sv-projects')($$$);
	const fs = require('fs');
	const app = $$$.app;
	const express = $$$.express;
	const errorHeader = '<h1>Something broke!</h1><br/>';

	const privateProjects = process.env.PRIVATE_PROJECTS;
	const isNotPrivate = (dir) => !privateProjects.toLowerCase().has(dir.toLowerCase());

	function status500(res, msg) {
		res.status(500).send(errorHeader + msg);
	}

	$$$.status500 = status500;


	app.use(function(req, res, next) {
		var url = req.url;
		if(url.endsWith('/') && url.length > 1) {
			trace("Redirect trailing slash!");
			res.redirect(301, url.slice(0, -1));
		} else
			next();
	});
	
	app.use('/test', express.static($$$.__test));
	app.use('/', preprocessIndexHTML);
	app.use('/', express.static($$$.__public));
	app.use('/js', express.static($$$.__common));
	app.use('/p/:project/json', serveProjectJSON);
	app.use('/p/:project/*', serveStaticProjectFiles);
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
			gitInfo: 'Last Updated: <i class="git-date">$2</i> <i class="git-hash">($0 : $1)</i>'.rep([$$$.git.branch, $$$.git.short, $$$.git.date])
		};

		return $$$.fileRead($$$.__indexhtml).rep(siteReps);
	}

	function getCached(address) {
		if(!address) {
			if($$$.isDev) {
				return getCachedRoot();
			}
			return cache['/'];
		}

		if(!cache[address] || $$$.isDev) {
			cache[address] = $$$.fileRead(address);
		}
		return cache[address];
	}

	function preprocessIndexHTML(req, res, next) {
		if(req.url!=="/") return next();

		$$$.getDirs($$$.__projects, (dirs) => {
			var projectLinks = dirs.filter(isNotPrivate)
				.map( d => {
					return '<li><a href="/p/$0">$1</a></li>'.rep([d, d]);
				})
				.join('\n');

			res.send(getCached().rep({
				pageHTML: `<ul>${projectLinks}</ul>`,
				pageCSS: '',
				pageJS: '',
				projectName: ''
			}));
		});
	}

	function preprocessProject(req, res, next) {
		var proj = projectsUtils.getProjectObj(req.params.project);
		if(!proj) return next();

		if(!$$$.fileExists(proj.__indexhtml)) {
			traceError("Project Index missing");
			return next();
		}

		var projectHTML = getCached(proj.__indexhtml);
		var projectCSS = $$$.createCSSTags([
			'/p/'+proj.name+'/css/project.css'
		]).join('\n');

		var projectJS = $$$.createScriptTags([
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
		var urlEnd = url.replace('/p/' + proj.name, '');
		var urlFile = proj.__path + urlEnd;

		if(!$$$.fileExists(urlFile)) {
			return next();
			//return status500(res, 'Missing File: ' + urlEnd);
		}

		return res.sendFile(urlFile);
	}
	
	function serveProjectJSON(req, res, next) {
		var projectName = req.params.project;
		var proj = projectsUtils.getProjectObj(projectName);
		if(!proj) return status500(res, "Requested JSON of unknown project: " + projectName);

		var fullpath = $$$.fullUrl(req);
		var paramStr = fullpath.split('/json').pop().trim();

		switch(req.method) {
			case 'PUT':
			case 'POST':
			case 'GET':

				if(!$$$.fileExists(proj.__json)) {
					return res.send({error: 'missing file'});
				}

				$$$.fileRead(proj.__json, onJSONRead);
				
				break;
			
			default: status500(res, 'Unhandled JSON HTTP method: ' + req.method);	
		}

		function onJSONRead(err, content) {
			if(err) return status500(res, 'Error while reading the JSON file.');

			if(!!paramStr && !!paramStr.length) {
				var cmd = {
					command: 'onJSONParams',
					content: content,
					params: paramStr.substr(1).split('/'),
					proj: proj,
					res: res,
				};

				$$$.hideProperties(cmd, 'content,res');
				$$$.processProjectCommand(cmd);

				return;
			}

			$$$.sendJSON(res, content);
		}
	}

	$$$.sendJSON = function(res, content) {
		//res.header('Access-Control-Allow-Origin','*');
		//res.header('Access-Control-Allow-Credentials','true');
		res.header('content-type','application/json'); //text/plain
		res.send(content);
	}
};