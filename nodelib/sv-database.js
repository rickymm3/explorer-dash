/**
 * Created by chamberlainpi on 2017-02-07.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.Model;
const Query = mongoose.Query;
const ObjectID = Schema.ObjectId;
const Redis = require('redis');

module.exports = function($$$) {
	return;

	startRedisClient();
	
	function startRedisClient() {
		trace("Attempting to connect on Redis...");
		
		var client = $$$.redis = Redis.createClient({
			retry_strategy(options) {
				if(options.error) return options.error;
				if(options.attempt<2) {
					trace("Reattempt... ($0)".rep(options.attempt));
					return Math.min(options.attempt * 100, 2000);
				}
				
				return new Error("Redis Error: Retry Attempts failed, abandon connection.");
			}
		});
		client.on('error', function(err) {
			traceError("Redis failed to start: " + err);
		});

		client.on('connect', function() {
			trace("Connected Redis! :)");
		});
	}
	
	trace("(Mongo Disabled for now)".yellow);

	mongoose
		.connect($$$.__mongodb)
		.then(() => {
			trace("Mongo is connected!".yellow);
		})
		.catch((err) => {
			trace("Mongo: Oh no something happened! $0".rep([err]).red)
		});

	$$$.models = {};
	$$$.mongo = mongoose;
	$$$.schemas = SCHEMAS;

	extendMongoose();

	_.keys($$$.schemas).forEach(name => {
		$$$.models[name] = mongoose.model(name, $$$.schemas[name]);
	});

	const UserLogin = $$$.models.UserLogin;

	/*
	UserLogin.has(
		{name: 'Pierre'},

		(pierre) => {
			pierre.set('lastLogin', new Date());
			pierre.set('isLogged', true);
			pierre.save();
			trace(pierre);
		},

		() => {
			var pierre = new UserLogin({name: "Pierre"});
			pierre.save();
		}
	);
	*/
};

const SCHEMAS = {};

SCHEMAS.UserPref = new Schema({
	bgColor: String,
	fgColor: String
});

SCHEMAS.UserLogin = new Schema({
	id: ObjectID,
	name: String,
	auth: String,
	lastLogin: Date,
	isLogged: Boolean,
	prefs: SCHEMAS.UserPref
});

function extendMongoose() {
	Model.has = function Model_has(what, cb, cbNot) {
		this.findOne(what, function(err, found) {
			if(err) return traceError(err);
			if(!found) return cbNot();

			cb(found);
		});
	};
}