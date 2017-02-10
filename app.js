const _ = global._ =	require('underscore');
const env =				require('dotenv').load({path: '.private/env.ini'});
const extensions =		require('./nodelib/common/extensions');
const colors =			require('colors');

const ERDS = global.ERDS = {__dirname: __dirname.fixSlashes()};
const express =			ERDS.express = require('express');
const app =				ERDS.app = express();
const server =			ERDS.server = require('http').createServer(app);
const io =				ERDS.io = require('socket.io')(server);

if(ERDS.isDev) traceClear();

require('./nodelib/sv-helpers')(ERDS);
require('./nodelib/sv-paths')(ERDS);
ERDS.loadModules('./nodelib', ERDS);

if (ERDS.isTest && ERDS.fileExists('./nodelib/test.js')) {
	return require('./nodelib/test'); //Early EXIT when running in Test-mode.
}

server.listen(ERDS.port, function (err) {
	if(err) throw err;
	trace("Started Express on '$0' (or '$1')".rep([ERDS.__host, ERDS.__localhost]).yellow);
});