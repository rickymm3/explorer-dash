/**
 * Created by Chamberlain on 11/07/2017.
 */

const GoogleSheet = require('google-spreadsheet');
const async = require('async');
const dateFormat = require('dateformat');

const STATUS = {
	IDLE: 0,
	READY: 1,
	BUSY: 2,
};

module.exports = function(PROJ) {

	var $$$ = PROJ.$$$;
	var app = $$$.app;
	var intervals = [2000, 5000, 2000];

	var current = null;
	var sheets;

	$$$.startFetching = function() {
		if(PROJ._status) return;

		trace("Starting Server...".green);
		current = { sheet: null, id: -1, status: 0 };

		PROJ._status = _.loop(fetch);
		sendRefresh();
	};

	$$$.stopFetching = function() {
		if(!PROJ._status) return;
		trace("Stopping Server...".green);
		clearTimeout(PROJ._status.id);
		PROJ._status = null;
		sendRefresh();
	};

	function sendRefresh(isRewritingJSON) {
		var refreshData = _.extend({status: !!PROJ._status}, PROJ.jsonData);
		$$$.io.emit('g2j-refresh', refreshData);

		isRewritingJSON && $$$.rewriteJSON();
	}

	$$$.sendRefresh = sendRefresh;

	function fetch() {
		if(!PROJ.jsonData) return 2500;

		sheets = PROJ.jsonData.sheets;

		current.status = processSheet(current);

		if(!PROJ._status) return 0;

		return intervals[current.status] || 1000;
	}

	function processSheet() {
		if(!current.sheet) {
			if((++current.id) >= sheets.length) {
				current.id = -1;
				return STATUS.IDLE;
			}

			current.sheet = sheets[current.id];

			current.sheet.status = {
				processing: 'This sheet started processing at:<br/><b>' + getTimestamp() + '</b>'
			};

			sendRefresh(true);
		}

		trace(`Processing sheet (${current.id+1}/${sheets.length}) ${current.sheet.urlAlias}`);

		if(current.status===STATUS.BUSY) return STATUS.BUSY;

		trace("Started!".green);

		getSpreadsheet(PROJ, current, (err) => {
			current.sheet.lastFetched = getTimestamp();

			if(err) {
				current.sheet.status = {
					error: err
				};

				traceError(err);
			} else {
				current.sheet.status = {
					done: `Finished processing the sheet:<br/><b>${current.sheet.info.title}</b><br/>
							Date Modified:<br/><b>${current.sheet.info.updated}</b>`
				}
			}

			current.status = STATUS.READY;
			current.sheet = null;

			sendRefresh(true);

			trace("Done!".yellow);
		});

		return current.status;
	}

	function getSpreadsheet(PROJ, current, cb) {
		var id = getGoogleDocID( current.sheet.urlSource );

		var gDoc = new GoogleSheet(id);
		var gSheet;
		var worksheets;

		async.series([
			function setAuth(next) {
				gDoc.useServiceAccountAuth(PROJ.creds, next);
			},

			function getInfoAndWorksheets(next) {
				gDoc.getInfo((err, info) => {
					if(err) {
						if(err.has('403')) {
							return cb('Error: HTTP error 403 (Forbidden).<br/>Make sure you granted access to your Google Service Email address.');
						}

						return cb(err);
					}

					if(current.sheet.info && current.sheet.info.updated===info.updated) {
						return cb(null);
					}

					current.sheet.info = {
						id: info.id,
						title: info.title,
						updated: info.updated,
						author: info.author,
						numWorksheets: info.worksheets.length
					};

					worksheets = info.worksheets;

					next();
				})
			},

			function checkEachWorksheets(next) {
				var counter = new Counter(worksheets, next, (worksheet, id) => {
					gSheet = worksheet;

					// gSheet.getRows({
					//
					// });

					counter.next();
				});
			},

			function onDone() {
				cb(null);
			}
		]);
	}
};

function getTimestamp() {
	return dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
}

function getGoogleDocID(fullURL) {
	var regex = /\/d\/([^\/]*)/;
	var matches = regex.exec(fullURL);
	return matches[1];
}