const ERDS = global.ERDS = {};

require('dotenv').load({path: '.private/env.ini'});

const express = ERDS.express = require('express');
const app = ERDS.app = express();
const server = ERDS.server = require('http').createServer(app);
const io = ERDS.io = require('socket.io')(server);
const __ = global.__ = require('lodash');
const colors = require('colors');
const port = process.env.PORT || 9999;

app.set("__rootpath", __dirname);
app.set("port", port);

//Require a bunch of homemade modules for each parts of this web-app: 
require('./nodelib/common/extensions');
require('./nodelib/helpers')(ERDS);
require('./nodelib/routes-tester')(ERDS);
require('./nodelib/routes')(ERDS);
require('./nodelib/handlers-errors')(ERDS);
require('./nodelib/handlers-sockets')(ERDS);

if(__.isTrue(process.env.RUN_TEST)) {
	trace("process.env.RUN_TEST: " + process.env.RUN_TEST);
	require('./test');
}

server.listen(app.get("port"), function(err) {
	trace("Started Express successfully on port #$port ...".rep({port: port}).yellow);
});