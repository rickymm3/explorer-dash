/**
 * Created by Chamberlain on 14/12/2016.
 */

var app, server, io, clients;

module.exports = function(ERDS) {
	const projectsUtils = require('./sv-projects')(ERDS);

	server = ERDS.server;
	app = ERDS.app;
	io = ERDS.io;
	clients = ERDS.clients = [];

	ERDS.projects = {};
	//test
	io.on('connection', client => {
		trace((" >>> " + client.id).yellow);
		//clients.push(client);

		client.on('echo', onEcho);
		client.on('disconnect', onDisconnect);
		client.on('project-fetch', onProjectFetch);
		client.on('project-command', onProjectCommand);
		
		if(ERDS.isDev) {
			client.on('kill', () => process.exit());
		}
	});
	
	ERDS.beep = function() {
		ERDS.io.emit('beep');
	};

	ERDS.sendServerError = function(client, msg) {
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
		if(!proj) return ERDS.sendServerError(this, "Project does not exists: " + projectName);

		//Set circular reference (for sub-modules to find ERDS or the Project):
		proj.ERDS = ERDS;
		ERDS.projects[proj.name] = proj;
		
		var responseData = proj.responseData = {
			name: proj.name,
			yargs: ERDS.yargs
		};
		
		//Load specific project's modules:
		if(ERDS.fileExists(proj.__nodelib)) {
			ERDS.loadModules(proj.__nodelib, proj, true); //ERDS.isDev
		} else {
			traceError("No /nodelib/ folder found for project: \n" + proj.__nodelib);
		}

		tryLoadingJSON(client, proj, responseData);
	}

	function tryLoadingJSON(client, proj, responseData) {
		if(ERDS.fileExists(proj.__json)) {
			ERDS.fileRead(proj.__json, (err, content) => {
				if(err) responseData.json = null;
				else responseData.json = JSON.parse(content);

				client.emit('project-fetch', responseData);
			});
			return;
		}

		var __jsData = proj.__json.replace('.json', '.js');
		if(ERDS.fileExists(__jsData)) {
			responseData.json = require(__jsData);
			client.emit('project-fetch', responseData);
			return;
		}

		traceError("No JSON/JS data file found for project: \n" + proj.__json);
	}
	
	function onProjectCommand(cmd) {
		var _this = this;
		var proj = ERDS.projects[cmd.project];
		if(!proj) return ERDS.sendServerError(this, "Project does not exists OR requires refresh: " + cmd.project);

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
		if(!cmdMethod) return ERDS.sendServerError(cmd.client, "Unknown command! " + cmd.command);
		cmdMethod(cmd);
	}
};