/**
 * Created by Chamberlain on 15/12/2016.
 */

(function() {
	var socket = ERDS.io = io();

	socket.on('projects-updated', function(data) {
		ERDS.vue.projectsUpdated(data);
	});
})();
