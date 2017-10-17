//const formidable = require('formidable');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
//const JSZip = require("jszip");

module.exports = function(PROJ) {

	const $$$ = PROJ.$$$;
	const app = $$$.app;

	const __creds = PROJ.__data + "/erds-2017-google-api.json";
	const __sheets = PROJ.__data + '/sheets';
	const __json = PROJ.__json; //.replace('.json', '.js');
	const creds = PROJ.creds = require(__creds);

	PROJ.__sheets = __sheets;

	mkdirp(__sheets);

	var sheets;

	$$$.loadSheetJSON = () => {
		var jsonStr = $$$.fileRead(__json);
		PROJ.jsonData = JSON.parse(jsonStr);

		$$$.updateSheetReferences();
	};

	$$$.getPathSheetJSON = str => PROJ.__sheets + `/${str}.json`;

	$$$.rewriteJSON = () => {
		$$$.fileWrite(__json, JSON.stringify(PROJ.jsonData, null, '  '));

		$$$.updateSheetReferences();
	};

	$$$.updateSheetReferences = () => {
		sheets = PROJ.jsonData.sheets;
		sheets.forEach(sheet => sheet.__sheetJSON = $$$.getPathSheetJSON(sheet.urlAlias));
	};

	if(!$$$.fileExists(__json)) {
		$$$.makeDir(__json, $$$.rewriteJSON);
		PROJ.jsonData = {sheets: []};
	} else {
		$$$.loadSheetJSON();
	}

	if(!PROJ.jsonData.sheets) PROJ.jsonData.sheets = [];

	$$$.updateSheetReferences();

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

			opts.rewriteJSON && $$$.rewriteJSON();
			opts.sendJSON && res.json(PROJ.jsonData);

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

	route('/g2j/mark-stable', {rewriteJSON: true}, (body, res) => {
		$$$.loadSheetJSON();

		var existingSheet = sheets.find(sheet => sheet.guid===body.guid);
		if(!existingSheet) {
			return status500(res, "Sheet does not exists.");
		}

		if(!existingSheet.stableVersion) {
			existingSheet.stableVersion = 0;
		}

		const version = ++existingSheet.stableVersion;

		const __stableJSON = $$$.getStableVersion(existingSheet.__sheetJSON, version);

		$$$.fileCopy(existingSheet.__sheetJSON, __stableJSON, (err) => {
			if(err) {
				var msg = err.message || err;
				return status500(res, 'Could not make a stable-version copy: ' + msg);
			}

			res.send(existingSheet.urlAlias + "/stable/" + version);
		});
	});

	route('/g2j/test-hooks', (body, res) => {
		var sheet = sheets.find(sheet => sheet.guid===body.guid);
		if(!sheet) {
			return status500(res, "Sheet does not exists.");
		}

		$$$.fileRead(sheet.__sheetJSON, (err, content) => {
			var hookData = _.extend({data: JSON.parse(content)}, sheet);

			$$$.notifyWebhooks(hookData, body.webhook)
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

	const routeJSON = $$$.express.Router();

	routeJSON.use('/*', (req, res, next) => {
		res.type('json');
		next();
	});

	routeJSON.use('/:urlAlias', (req, res, next) => {
		var urlAlias = req.params.urlAlias;

		req.__sheetJSON = $$$.getPathSheetJSON(urlAlias);

		if(!$$$.fileExists(req.__sheetJSON)) {
			return status500(res, `JSON data not found for "${urlAlias}". May need to fetch and parse the sheet first.`);
		}

		if(req.url==='/') {
			$$$.fileRead(req.__sheetJSON, (err, content) => {
				if(err) return status500(res, `Trouble reading the JSON file: ${__sheetJSON}`);

				res.send(content);
			});
			return;
		}

		next();
	});

	$$$.getStableVersion = (path, version) => path.replace('.json', '.v' + (version+'').padLeft('0000') + '.json');

	routeJSON.use('/:urlAlias/stable/:stableVersion', (req, res, next) => {
		const urlAlias = req.params.urlAlias;
		const versionStr = req.params.stableVersion;
		const version = parseFloat(versionStr);
		if(isNaN(versionStr) || version!==(version|0)) return status500(res, `URL /${req.params.urlAlias}/stable/:stableVersion/ must be an integer.`);

		const __stableJSON = $$$.getStableVersion(req.__sheetJSON, versionStr);

		if(!$$$.fileExists(__stableJSON)) {
			trace("No stable file: " + __stableJSON);
			return status500(res, `URL alias /${urlAlias}/ does not contain any file under stable-version #${version}.`);
		}

		$$$.fileRead(__stableJSON, (err, content) => {
			res.send(content);
		});
	});

	app.use('/g2j/json', routeJSON);
};