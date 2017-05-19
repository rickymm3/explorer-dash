const os = require('os');
const mkdirp = require('mkdirp');
const argv = require('yargs').argv;

module.exports = function($$$) {
	//Store a bunch of common useful root & subfolder paths:
	const app = $$$.app;
	const __rootpath = $$$.__dirname;

	//Local Filesystem Addresses:
	app.set('__rootpath', $$$.__rootpath = __rootpath);
	app.set('__test', $$$.__test = __rootpath + '/test');
	app.set('__public', $$$.__public = __rootpath + '/public');
	app.set('__nodelib', $$$.__nodelib = __rootpath + '/nodelib');
	app.set('__indexhtml', $$$.__indexhtml = __rootpath + '/public/index.html');
	app.set('__projects', $$$.__projects = __rootpath + '/projects');
	app.set('__private', $$$.__private = __rootpath + '/.private');
	app.set('__common', $$$.__common = __rootpath + '/nodelib/common');
	app.set('__data', $$$.__data = __rootpath + '/.private/data');

	mkdirp($$$.__data);

	//Remote Addresses:
	app.set('port', $$$.port = process.env.PORT || 9999);
	app.set('__localhost', $$$.__localhost = 'localhost:' + $$$.port);
	app.set('__hostname', $$$.__hostname = os.hostname());
	app.set('__host', $$$.__host = $$$.__hostname + ':' + $$$.port);
	app.set('__mongodb', $$$.__mongodb = 'mongodb://localhost/erds');

	$$$.isTest = _.isTruthy(process.env.IS_TEST);
	$$$.isDev = _.isTruthy(process.env.IS_DEV);
	$$$.yargs = argv;
};