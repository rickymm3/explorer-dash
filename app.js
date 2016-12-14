const ERDS = {};

const express = ERDS.express = require('express');
const app = ERDS.app = express();
const server = ERDS.server = require('http').createServer(app);
const io = ERDS.io = require('socket.io')(server);
const __ = global.__ = require('lodash');
const colors = require('colors');

app.set("__rootpath", __dirname);
app.set("port", process.env.PORT || 9999);

//Require a bunch of homemade modules for each parts of this web-app: 
require('./nodelib/common/extensions');
require('./nodelib/helpers')(ERDS);
require('./nodelib/routes-tester')(ERDS);
require('./nodelib/routes')(ERDS);
require('./nodelib/handlers-errors')(ERDS);
require('./nodelib/handlers-sockets')(ERDS);

server.listen(app.get("port"), function(err) {
	trace("Started Express successfully.".yellow);
});

var hasJSExtension = (file, fullpath) => file.contains('.js');
trace( ERDS.filesFilter("./public", hasJSExtension) );