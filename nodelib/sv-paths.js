const os = require('os');
const mkdirp = require('mkdirp');

module.exports = function(ERDS) {
	//Store a bunch of common useful root & subfolder paths:
	const app = ERDS.app;
	const __rootpath = ERDS.__dirname;

	//Local Filesystem Addresses:
	app.set('__rootpath', ERDS.__rootpath = __rootpath);
	app.set('__test', ERDS.__test = __rootpath + '/test');
	app.set('__public', ERDS.__public = __rootpath + '/public');
	app.set('__nodelib', ERDS.__nodelib = __rootpath + '/nodelib');
	app.set('__indexhtml', ERDS.__indexhtml = __rootpath + '/public/index.html');
	app.set('__projects', ERDS.__projects = __rootpath + '/projects');
	app.set('__private', ERDS.__private = __rootpath + '/.private');
	app.set('__common', ERDS.__common = __rootpath + '/nodelib/common');
	app.set('__data', ERDS.__data = __rootpath + '/.private/data');

	mkdirp(ERDS.__data);

	//Remote Addresses:
	app.set('port', ERDS.port = process.env.PORT || 9999);
	app.set('__localhost', ERDS.__localhost = 'localhost:' + ERDS.port);
	app.set('__hostname', ERDS.__hostname = os.hostname());
	app.set('__host', ERDS.__host = ERDS.__hostname + ':' + ERDS.port);
	app.set('__mongodb', ERDS.__mongodb = 'mongodb://localhost/erds');

	ERDS.isTest = _.isTruthy(process.env.IS_TEST);
	ERDS.isDev = _.isTruthy(process.env.IS_DEV);
};