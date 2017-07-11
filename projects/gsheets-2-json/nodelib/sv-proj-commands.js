//const formidable = require('formidable');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const JSZip = require("jszip");
const GoogSheet = require('google-spreadsheet');


module.exports = function(PROJ) {

	var $$$ = PROJ.$$$;
	var app = $$$.app;

	var __sheets = PROJ.__data + '/sheets';
	mkdirp(__sheets);

	var sheets;
	var __json = PROJ.__json; 		//.replace('.json', '.js');
	var jsonData = {};

	if(!$$$.fileExists(__json)) {
		$$$.makeDir(__json, () => {
			rewriteJSON();
		});
	} else {
		jsonData = require(__json);
	}

	if(!jsonData.sheets) jsonData.sheets = [];
	sheets = jsonData.sheets;

	function rewriteJSON() {
		$$$.fileWrite(__json, _.jsonPretty(jsonData));
	}

	function status500(res, msg) {
		return res.status(500).send("GSheet-2-JSON Error: " + msg);
	}

	function statusNotAuth(req, res) {
		return status500(res, `Not authorized to serve at this web address. ${$$$.fullUrl(req)}`);
	}

	function checkAuth(req, res) {
		if(req.headers.authorization!==jsonData.authorization) {
			statusNotAuth(req, res);
			return false;
		}

		return true;
	}

	///////////////////////////////////////////// ROUTES:

	function route(url, opts, cbReqRes) {
		if(arguments.length===2) {
			cbReqRes = opts;
			opts = null;
		}

		if(!opts) opts = {rewriteJSON: true, sendJSON: true};

		app.use(url, (req, res, next) => {
			if(!checkAuth(req, res)) return;

			trace(req.body);
			trace(req.headers);

			var result = (cbReqRes.length===1 ? cbReqRes(req.body) : cbReqRes(req, res, next));

			opts.rewriteJSON && rewriteJSON();
			opts.sendJSON && res.json(jsonData);

			return result;
		});
	}

	route('/g2j/add', (body) => {
		var existingSheet = sheets.find(sheet => sheet.guid===body.guid);
		if(existingSheet) {
			_.extend(existingSheet, body);
			trace("Overwrite sheet: " + existingSheet.guid);
			trace(existingSheet);
		} else {
			sheets.push(body);
		}
	});

	route('/g2j/remove', (body) => {
		var existingSheet = sheets.find(sheet => sheet.guid===body.guid);
		if(!existingSheet) {
			return status500("Sheet does not exists.");
		}

		sheets.remove(existingSheet);
	})
};