/**
 * Created by Chamberlain on 14/12/2016.
 */

var app, server, io, clients;

module.exports = function($$$) {
	const projectsUtils = require('./sv-projects')($$$);

	server = $$$.server;
	app = $$$.app;
	io = $$$.io;
	clients = $$$.clients = [];

	$$$.projects = {};
	//test
	io.on('connection', client => {
		trace((" >>> " + client.id).yellow);
		//clients.push(client);

		client.on('echo', onEcho);
		client.on('disconnect', onDisconnect);
		client.on('project-fetch', onProjectFetch);
		client.on('project-command', onProjectCommand);
		
		if($$$.isDev) {
			client.on('kill', () => process.exit());
		}
	});
	
	$$$.beep = function() {
		$$$.io.emit('beep');
	};

	$$$.sendServerError = function(client, msg) {
		traceError(msg);
		client.emit("server-error", msg);
	};

	function onDisconnect() {
		trace(("    <<< " + this.id).red);
	}

	function onEcho(data) {
		this.emit("echo", data);
	}

	function onProjectFetch(projectName) {
		if(!projectName || !projectName.length) return;

		var client = this;
		var proj = projectsUtils.getProjectObj(projectName);
		if(!proj) return $$$.sendServerError(this, "Project does not exists: " + projectName);

		//Set circular reference (for sub-modules to find $$$ or the Project):
		proj.$$$ = $$$;
		$$$.projects[proj.name] = proj;
		
		var responseData = proj.responseData = {
			name: proj.name,
			yargs: $$$.yargs
		};
		
		//Load specific project's modules:
		if($$$.fileExists(proj.__nodelib)) {
			$$$.loadModules(proj.__nodelib, proj, true); //$$$.isDev
		} else {
			traceError("No /nodelib/ folder found for project: \n" + proj.__nodelib);
		}

		tryLoadingJSON(client, proj, responseData);
	}

	function tryLoadingJSON(client, proj, responseData) {
		if($$$.fileExists(proj.__json)) {
			$$$.fileRead(proj.__json, (err, content) => {
				if(err) responseData.json = null;
				else responseData.json = JSON.parse(content);

				client.emit('project-fetch', responseData);
			});
			return;
		}

		var __jsData = proj.__json.replace('.json', '.js');
		if($$$.fileExists(__jsData)) {
			responseData.json = require(__jsData);
			client.emit('project-fetch', responseData);
			return;
		}

		traceError("No JSON/JS data file found for project: \n" + proj.__json);
	}
	
	function onProjectCommand(cmd) {
		var _this = this;
		var proj = $$$.projects[cmd.project];
		if(!proj) return $$$.sendServerError(this, "Project does not exists OR requires refresh: " + cmd.project);

		cmd.proj = proj;
		cmd.client = this;
		cmd.dateServer = new Date();
		
		//_.delay(() => {
		//	
		//}, 500);

		processProjectCommand(cmd);
	}
	
	function processProjectCommand(cmd) {
		var cmdMethod = cmd.proj.commands[cmd.command];
		if(!cmdMethod) return $$$.sendServerError(cmd.client, "Unknown command! " + cmd.command);
		cmdMethod(cmd);
	}
};