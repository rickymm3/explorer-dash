/**
 * Created by chamberlainpi on 2017-02-06.
 */

module.exports = function(ERDS) {
	const app = ERDS.app;
	const express = ERDS.express;

	app.use('/', express.static(ERDS.__public));
	app.use('/js', express.static(ERDS.__common));
};