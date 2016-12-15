const ERDS = global.ERDS = {};

require('dotenv').load({path: '.private/env.ini'});

const git = require('git-rev');
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
ERDS.isDev = _.isTruthy(process.env.IS_DEV);

git.branch(branchName => {
	git.long(longTag => {
		ERDS.git = {branch:branchName, tag:longTag};
		onReady();
	});
});

function onReady() {
	app.set("__rootpath", __rootpath);
	app.set("__public", __rootpath + "/public");
	app.set("__projects", __rootpath + "/projects");
	app.set("__private", __rootpath + "/.private");
	app.set("port", port);

	//Require a bunch of homemade modules for each parts of this web-app: 

	require('./nodelib/helpers')(ERDS);
	require('./nodelib/routes-tester')(ERDS);
	require('./nodelib/routes')(ERDS);
	require('./nodelib/sockets')(ERDS);
	require('./nodelib/handlers-errors')(ERDS);


	if (ERDS.isTest) {
		trace("process.env.RUN_TEST: " + process.env.IS_TEST);
		require('./nodelib/test');
	}

	server.listen(app.get("port"), function (err) {
		trace("Started Express successfully on port #$port ...".rep({port: port}).yellow);
	});
}