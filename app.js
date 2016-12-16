const ERDS = global.ERDS = {};

const _ = global._ =	require('underscore');
const env =				require('dotenv').load({path: '.private/env.ini'});
const extensions =		require('./nodelib/common/extensions');
const colors =			require('colors');
const express =			ERDS.express = require('express');
const app =				ERDS.app = express();
const server =			ERDS.server = require('http').createServer(app);
const io =				ERDS.io = require('socket.io')(server);
const port =			process.env.PORT || 9999;

//Store a bunch of common useful root & subfolder paths:
const __rootpath = __dirname.fixSlashes();
app.set("__rootpath", ERDS.__rootpath = __rootpath);
app.set("__public", ERDS.__public = __rootpath + "/public");
app.set("__projects", ERDS.__projects = __rootpath + "/projects");
app.set("__private", ERDS.__private = __rootpath + "/.private");
app.set("port", ERDS.port = port);

traceClear();

ERDS.isTest = _.isTruthy(process.env.IS_TEST);
ERDS.isDev = _.isTruthy(process.env.IS_DEV);

if (ERDS.isTest) {
	trace("process.env.IS_TEST: " + process.env.IS_TEST);
	require('./nodelib/test');
	
	return; //Early EXIT when running in Test-mode.
}

require('./nodelib/sv-gitinfo')(ERDS, onReady);

function onReady() {
	//Require a bunch of homemade modules for each parts of this web-app:
	require('./nodelib/sv-helpers')(ERDS);
	require('./nodelib/sv-routes-tester')(ERDS);
	require('./nodelib/sv-routes')(ERDS);
	require('./nodelib/sv-sockets')(ERDS);
	require('./nodelib/sv-dashboard')(ERDS);
	require('./nodelib/sv--errors')(ERDS);
	
	//Finally, start the server and listen for incoming connections:
	server.listen(app.get("port"), function (err) {
		trace("Started Express on localhost:$0".rep([port]).yellow);
	});
}