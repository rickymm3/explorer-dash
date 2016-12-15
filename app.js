const ERDS = global.ERDS = {};

require('dotenv').load({path: '.private/env.ini'});

const express = ERDS.express = require('express');
const app = ERDS.app = express();
const server = ERDS.server = require('http').createServer(app);
const io = ERDS.io = require('socket.io')(server);
const _ = global._ = require('underscore');
const colors = require('colors');
const port = process.env.PORT || 9999;
const extensions = require('./nodelib/common/extensions');
const __rootpath = __dirname.fixSlashes();

traceClear();

ERDS.isTest = _.isTruthy(process.env.IS_TEST);

app.set("__rootpath", __rootpath);
app.set("__public", __rootpath + "/public");
app.set("__projects", __rootpath + "/projects");
app.set("port", port);

//Require a bunch of homemade modules for each parts of this web-app: 

require('./nodelib/helpers')(ERDS);
require('./nodelib/routes-tester')(ERDS);
require('./nodelib/routes')(ERDS);
require('./nodelib/handlers-errors')(ERDS);
require('./nodelib/handlers-sockets')(ERDS);

if(ERDS.isTest) {
	trace("process.env.RUN_TEST: " + process.env.IS_TEST);
	require('./nodelib/test');
}

server.listen(app.get("port"), function(err) {
	trace("Started Express successfully on port #$port ...".rep({port: port}).yellow);
});