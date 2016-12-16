
module.exports = function(ERDS) {
	server = ERDS.server;
	server.on('error', errPortAddressInUse);
};

var server;

function errPortAddressInUse(err) {
	if (err) {
		if (err.message.contains('EADDRINUSE')) {
			return trace("Oh no, address in use!".red);
		}

		throw err;
	}
}