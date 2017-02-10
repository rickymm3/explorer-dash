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
	
	io.on('connection', client => {
		trace((" >>> " + client.id).yellow);
		//clients.push(client);

		client.on('echo', onEcho);
		client.on('disconnect', onDisconnect);
		client.on('project-fetch', onProjectFetch);
		client.on('project-command', onProjectCommand);
	});

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
		
		//Load specific project's modules:
		ERDS.loadModules(proj.__nodelib, proj, true); //ERDS.isDev
		
		ERDS.fileRead(proj.__json, (err, content) => {
			if(err) content = null;
			else content = JSON.parse(content);
			
			client.emit('project-fetch', {
				json: content,
				name: proj.name
			});
		});
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