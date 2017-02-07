module.exports = function(ERDS, dir) {
	//Store a bunch of common useful root & subfolder paths:
	const app = ERDS.app;
	const __rootpath = dir.fixSlashes();
	app.set("__rootpath", ERDS.__rootpath = __rootpath);
	app.set("__public", ERDS.__public = __rootpath + "/public");
	app.set("__projects", ERDS.__projects = __rootpath + "/projects");
	app.set("__private", ERDS.__private = __rootpath + "/.private");
	app.set("__common", ERDS.__common = __rootpath + "/nodelib/common");
	app.set("port", ERDS.port = process.env.PORT || 9999);

	ERDS.isTest = _.isTruthy(process.env.IS_TEST);
	ERDS.isDev = _.isTruthy(process.env.IS_DEV);
};