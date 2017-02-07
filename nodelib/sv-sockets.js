/**
 * Created by Chamberlain on 14/12/2016.
 */

var app, server, io;

module.exports = function(ERDS) {
	server = ERDS.server;
	app = ERDS.app;
	io = ERDS.io;
	
	io.on('connection', function(client) {
		trace("Hello Socket IO! from client: " + client.id);
		//ERDS.getProjectsList && ERDS.getProjectsList((data) => {
		//	client.emit('projectsUpdated', data);
		//});
	});
};