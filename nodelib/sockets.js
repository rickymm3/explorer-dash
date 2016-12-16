/**
 * Created by Chamberlain on 14/12/2016.
 */

var app, server, io;

module.exports = function(ERDS) {
	app = ERDS.app;
	server = ERDS.server;
	io = ERDS.io;
	
	io.on('connection', function(client) {
		ERDS.getProjectsList && ERDS.getProjectsList((data) => {
			client.emit('projectsUpdated', data);
		});
	});
};