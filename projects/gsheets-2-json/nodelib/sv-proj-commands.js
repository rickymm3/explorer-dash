//const formidable = require('formidable');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const JSZip = require("jszip");
const GoogSheet = require('google-spreadsheet');


/**
 * Created by Chamberlain on 27/03/2017.
 */
module.exports = function(PROJ) {

	var $$$ = PROJ.$$$;
	var app = $$$.app;

	var configPath = PROJ.__json.replace('.json', '.js');
	var configData = {};

	if(!$$$.fileExists(configPath)) {
		$$$.makeDir(configPath, () => {
			$$$.fileWrite(configPath, _.jsonPretty(configData));
		})
	} else {
		configData = require(configPath);
	}

	var __sheets = PROJ.__data + '/sheets';
	mkdirp(__sheets);

	var errorHeader = "GSheet-2-JSON Error: ";
	function status500(msg) {
		__res.status(500).send(errorHeader + msg);
	}

	app.get('/p/gsheets-2-json/add', (req, res, next) => {
		trace("Hello world!!!");
		res.send("none");
	})
};