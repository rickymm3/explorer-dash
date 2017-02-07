const ERDS = global.ERDS = {};

const _ = global._ =	require('underscore');
const env =				require('dotenv').load({path: '.private/env.ini'});
const extensions =		require('./nodelib/common/extensions');
const colors =			require('colors');
const express =			ERDS.express = require('express');
const app =				ERDS.app = express();
const server =			ERDS.server = require('http').createServer(app);
const io =				ERDS.io = require('socket.io')(server);

traceClear();

require('./nodelib/sv-paths')(ERDS, __dirname);

if (ERDS.isTest) {
	trace("process.env.IS_TEST: " + process.env.IS_TEST);
	require('./nodelib/test');
	
	return; //Early EXIT when running in Test-mode.
}

require('./nodelib/sv-gitinfo')(ERDS, onReady);

function onReady() {
	//Require a bunch of homemade modules for each parts of this web-app:
	//require('./nodelib/sv-helpers')(ERDS);
	//require('./nodelib/sv-routes-tester')(ERDS);
	//require('./nodelib/sv-routes')(ERDS);
	//require('./nodelib/sv-sockets')(ERDS);
	//require('./nodelib/sv-dashboard')(ERDS);
	//require('./nodelib/sv--errors')(ERDS);
	require('./nodelib/sv-routes')(ERDS);

	//Finally, start the server and listen for incoming connections:
	server.listen(app.get("port"), function (err) {
		if(err) throw err;
		trace("Started Express on localhost:$0".rep([ERDS.port]).yellow);
	});
}