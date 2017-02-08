/**
 * Created by chamberlainpi on 2017-02-07.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Model = mongoose.Model;
const Query = mongoose.Query;
const ObjectID = Schema.ObjectId;

module.exports = function(ERDS) {
	mongoose
		.connect(ERDS.__mongodb)
		.then(() => {
			trace("Mongo is connected!".yellow);
		})
		.catch((err) => {
			trace("Mongo: Oh no something happened! $0".rep([err]).red)
		});

	ERDS.models = {};
	ERDS.mongo = mongoose;
	ERDS.schemas = SCHEMAS;

	extendMongoose();

	_.keys(ERDS.schemas).forEach(name => {
		ERDS.models[name] = mongoose.model(name, ERDS.schemas[name]);
	});

	const UserLogin = ERDS.models.UserLogin;

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