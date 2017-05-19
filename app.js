const _ = global._ =	require('underscore');
const env =				require('dotenv').load({path: '.private/env.ini'});
const extensions =		require('./nodelib/common/extensions');
const colors =			require('colors');

const $$$ = global.$$$ = {__dirname: __dirname.fixSlashes()};
const express =			$$$.express = require('express');
const app =				$$$.app = express();
const server =			$$$.server = require('http').createServer(app);
const io =				$$$.io = require('socket.io')(server);

require('./nodelib/sv-helpers')($$$);
require('./nodelib/sv-paths')($$$);

if($$$.isDev) traceClear();

$$$.loadModules('./nodelib', $$$);

if ($$$.isTest && $$$.fileExists('./nodelib/test.js')) {
	return require('./nodelib/test'); //Early EXIT when running in Test-mode.
}

server.listen($$$.port, function (err) {
	if(err) throw err;
	trace("Started Express on '$0' (or '$1')".rep([$$$.__host, $$$.__localhost]).yellow);
});