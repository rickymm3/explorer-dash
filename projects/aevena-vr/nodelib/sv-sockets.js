/**
 * Created by chamberlainpi on 2017-02-07.
 */

module.exports = function(PROJ) {
	trace("Aevena Sockets!");

	const ERDS = PROJ.ERDS;
	const io = ERDS.io;

	if(!io) {
		return traceError("Missing Socket.IO for project!");
	}

	trace(io.sockets);
	//function serveProjectJSON(req, res, next) {
	//	var proj = svProjects.getProjectObj(req.params.project);
	//	if(!proj) return next();
	//
	//	var svJSONFile = proj.__nodelib + "/sv-json.js";
	//	if(!ERDS.fileExists(svJSONFile)) {
	//		throw new Error("JSON service not found for project: " + proj.name);
	//	}
	//
	//	var svJSON = require(svJSONFile)(ERDS, proj);
	//
	//	res.send({test: true});
	//
	//	next();
	//}
};