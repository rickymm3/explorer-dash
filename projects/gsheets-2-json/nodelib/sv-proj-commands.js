//const formidable = require('formidable');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const JSZip = require("jszip");

module.exports = function(PROJ) {

	var $$$ = PROJ.$$$;
	var app = $$$.app;

	var __creds = PROJ.__data + "/erds-2017-google-api.json";
	const creds = PROJ.creds = require(__creds);

	var __sheets = PROJ.__sheets = PROJ.__data + '/sheets';
	mkdirp(__sheets);

	var sheets;
	var __json = PROJ.__json; 		//.replace('.json', '.js');
	var jsonData = {};

	if(!$$$.fileExists(__json)) {
		$$$.makeDir(__json, () => {
			rewriteJSON();
		});
	} else {
		jsonData = PROJ.jsonData = require(__json);
	}

	if(!jsonData.sheets) jsonData.sheets = [];
	sheets = jsonData.sheets;
	sheets.forEach(sheet => {
		sheet.__sheetJSON = getPathSheetJSON(sheet.urlAlias);
	});

	function rewriteJSON() {
		$$$.fileWrite(__json, JSON.stringify(jsonData, null, '  '));

		PROJ.jsonData = jsonData;
	}

	$$$.rewriteJSON = rewriteJSON;

	function getPathSheetJSON(str) {
		return PROJ.__sheets + `/${str}.json`;
	};

	$$$.getPathSheetJSON = getPathSheetJSON;

	function status500(res, msg) {
		return res.status(500).send("GSheet-2-JSON Error: " + msg);
	}

	function statusNotAuth(req, res) {
		return status500(res, `Not authorized to serve at this web address. ${$$$.fullUrl(req)}`);
	}

	function checkAuth(req, res) {
		if(req.headers.authorization!==creds.authorization) {
			statusNotAuth(req, res);
			return false;
		}

		return true;
	}

	function route(url, opts, cbReqRes) {
		if(arguments.length===2) {
			cbReqRes = opts;
			opts = null;
		}

		if(!opts) opts = {rewriteJSON: true, sendJSON: true};

		app.use(url, (req, res, next) => {
			if(!checkAuth(req, res)) return;

			if(opts.doTrace) {
				trace(req.body);
				trace(req.headers);
			}

			var result = (cbReqRes.length===3 ? cbReqRes(req, res, next) : cbReqRes(req.body, res));

			if(!_.isUndefined(result)) {
				return;
			}

			opts.rewriteJSON && rewriteJSON();
			opts.sendJSON && res.json(jsonData);

			return result;
		});
	}

	///////////////////////////////////////////// ROUTES:

	const REGEX_VALID_URL_ALIAS = /^[a-z0-9]([a-z0-9\-\_]*)[a-z0-9]$/i;

	route('/g2j/add', (body, res) => {
		body.urlAlias = body.urlAlias.toLowerCase();

		if(!REGEX_VALID_URL_ALIAS.test(body.urlAlias)) {
			return status500(res, "Invalid URL Alias name! Must start with [a-z, 0-9], then [a-z, 0-9, - or _] and end with [a-z, 0-9]: " + body.urlAlias);
		}

		var existingSheet = sheets.find(sheet => sheet.guid===body.guid);
		if(existingSheet) {
			_.extend(existingSheet, body);
			trace("Overwrite sheet: " + existingSheet.guid);
			//trace(existingSheet);
		} else {
			sheets.push(body);
		}
	});

	route('/g2j/remove', (body, res) => {
		var existingSheet = sheets.find(sheet => sheet.guid===body.guid);
		if(!existingSheet) {
			return status500(res, "Sheet does not exists.");
		}

		sheets.remove(existingSheet);
	});

	route('/g2j/test-hooks', (body, res) => {
		var sheet = sheets.find(sheet => sheet.guid===body.guid);
		if(!sheet) {
			return status500(res, "Sheet does not exists.");
		}

		$$$.fileRead(sheet.__sheetJSON, (err, content) => {
			sheet.data = JSON.parse(content);

			$$$.notifyWebhooks(sheet, body.webhook)
				.then(hookResponses => {
					res.json(hookResponses);
				})
				.catch(err => {
					status500(res, "Error running the webhook: " + (err.message || err));
				});
		});

		return '';
	});

	route('/g2j/status', {}, (req, res, next) => {

		switch(req.method) {
			case 'POST':
				var isActive = _.isTruthy(req.body.status);
				if(isActive) {
					$$$.startFetching(req.body.forceUpdate);
				} else {
					$$$.stopFetching();
				}
				break;

			default:
				break;
		}

		res.json({status: !!PROJ._status});
	});

	app.use('/g2j/creds', (req, res) => {
		res.json({
			authorization: PROJ.creds.authorization,
			client_email: PROJ.creds.client_email,
		});

		$$$.sendRefresh();
	});

	app.use('/g2j/json/*', (req, res, next) => {
		var urlAlias = req.params[0];

		var __sheetJSON = $$$.getPathSheetJSON(urlAlias);

		if(!$$$.fileExists(__sheetJSON)) {
			return status500(res, `JSON data not found for "${urlAlias}". May need to fetch and parse the sheet first.`);
		}

		$$$.fileRead(__sheetJSON, (err, content) => {
			if(err) return status500(res, `Trouble reading the JSON file: ${__sheetJSON}`);

			res.type('json');
			res.send(content);
		});
	});
};