const ERDS = global.ERDS = {};

const _ = global._ = require('underscore');
const env = require('dotenv').load({path: '.private/env.ini'});
const extensions = require('./nodelib/common/extensions');
const colors = require('colors');
const port = process.env.PORT || 9999;
const git = require('git-rev');
const express = ERDS.express = require('express');
const app = ERDS.app = express();
const server = ERDS.server = require('http').createServer(app);
const io = ERDS.io = require('socket.io')(server);
const __rootpath = __dirname.fixSlashes();

traceClear();

ERDS.isTest = _.isTruthy(process.env.IS_TEST);
ERDS.isDev = _.isTruthy(process.env.IS_DEV);

if (ERDS.isTest) {
	trace("process.env.RUN_TEST: " + process.env.IS_TEST);
	require('./nodelib/test');
	return;
}

git.branch(branchName => {
	git.long(longTag => {
		ERDS.git = {branch:branchName, tag:longTag};
		onReady();
	});
});

function onReady() {
	app.set("__rootpath", ERDS.__rootpath = __rootpath);
	app.set("__public", ERDS.__public = __rootpath + "/public");
	app.set("__projects", ERDS.__projects = __rootpath + "/projects");
	app.set("__private", ERDS.__private = __rootpath + "/.private");
	app.set("port", ERDS.port = port);

	//Require a bunch of homemade modules for each parts of this web-app: 

	require('./nodelib/helpers')(ERDS);
	require('./nodelib/routes-tester')(ERDS);
	require('./nodelib/routes')(ERDS);
	require('./nodelib/sockets')(ERDS);
	require('./nodelib/handlers-errors')(ERDS);
	require('./nodelib/dashboard-funcs')(ERDS);

	server.listen(app.get("port"), function (err) {
		trace("Started Express successfully on port #$port ...".rep({port: port}).yellow);
	});
}