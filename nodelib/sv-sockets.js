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
		trace("Echoing: " + data);
		this.emit("echo", data);
	}

	function onFetchProject(projectName) {
		if(!projectName || !projectName.length) return;

		var client = this;
		var proj = projectsUtils.getProjectObj(projectName);
		if(!proj) return traceError("Project does not exists: " + proj);

		//Set circular reference (for sub-modules to find ERDS or the Project):
		proj.ERDS = ERDS;
		ERDS.projects[proj.name] = proj;

		ERDS.loadModules(proj.__nodelib, proj, true);

		ERDS.fileRead(proj.__indexhtml, (err, file) => {
			client.emit('fetch-project', {
				//projectHTML: file,
				name: proj.name
			});
		});
	}
};