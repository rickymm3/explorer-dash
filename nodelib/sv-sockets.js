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
	
	io.on('connection', onConnect);

	function onConnect(client) {
		trace(" >>> " + client.id);
		//clients.push(client);

		client.on('echo', onEcho);
		client.on('disconnect', onDisconnect);
		client.on('fetch-project', onFetchProject);
	}

	function onDisconnect() {
		trace("    <<< " + this.id);
	}

	function onEcho(data) {
		this.emit("echo", data);
	}

	function onFetchProject(projectName) {
		if(!projectName || !projectName.length) return;

		var proj = projectsUtils.getProjectObj(projectName);
		if(!proj) return traceError("Project does not exists: " + proj);

		proj.ERDS = ERDS;
		ERDS[proj.name] = proj;

		ERDS.loadModules(proj.__nodelib, proj, true);

		//this.emit()
	}
};