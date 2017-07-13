/**
 * Created by chamberlainpi on 2017-02-07.
 */
//const passport = require('passport');
//const redis = require('redis');
const session = require('express-session');
const timeMSOneDay = 1000 * 60 * 24;

module.exports = function($$$) {
	$$$.app.set('trust proxy', 1);
	$$$.app.use( session({
		secret: 'erds-web',
		resave: false,
		saveUninitialized: true,
		cookie: {maxAge: timeMSOneDay}
	}));

	$$$.auth = AUTH;
};

const AUTH = {

};