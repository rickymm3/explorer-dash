/**
 * Created by Chamberlain on 11/07/2017.
 */

const GoogleSheet = require('google-spreadsheet');
const async = require('async');
const dateFormat = require('dateformat');
const changeCase = require('change-case');
const needleRequest = require('needle');

const STATUS = { IDLE: 0, READY: 1, BUSY: 2 };

module.exports = function(PROJ) {

	var $$$ = PROJ.$$$;
	var intervals = [5000, 5000, 5000];

	var current = null;
	var processingStartedAt = null;
	var sheets;

	$$$.startFetching = function(forceUpdate) {
		if(PROJ._status) return;

		PROJ.forceUpdate = forceUpdate;

		current = { sheet: null, id: -1, status: 0 };

		PROJ._status = _.loop(fetch);

		$$$.sendRefresh();
	};

	$$$.stopFetching = function() {
		if(!PROJ._status) return;

		clearTimeout(PROJ._status.id);
		PROJ._status = null;

		$$$.sendRefresh();
	};

	$$$.sendRefresh = (isRewritingJSON) => {
		var refreshData = _.extend({status: !!PROJ._status}, PROJ.jsonData);
		$$$.io.emit('g2j-refresh', refreshData);

		isRewritingJSON && $$$.rewriteJSON();
	};

	function fetch() {
		if(!PROJ.jsonData) return 2500;

		sheets = PROJ.jsonData.sheets;

		processSheet();

		if(!PROJ._status) return 0;

		return intervals[current.status] || 1000;
	}

	function sendProcessing(fileCount) {
		current.sheet.status = {
			processing: `This sheet started processing at:<br/><b>${processingStartedAt}</b>`,
			fileCount: fileCount
		};

		$$$.sendRefresh(true);
	}

	$$$.notifyWebhooks = (sheet, hookToTest) => {
		const webhooks = sheet.webhooks;
		const data = sheet.data;

		return new Promise((resolve, reject) => {
			const hooks = webhooks.hooks;
			const promises = [];

			hooks.forEach(hook => {
				if(hookToTest && hook.guid!==hookToTest.guid) return;

				//Fill-in URL parameters: Merge the Hook & Sheet properties:
				var url = hook.url.rep(_.merge({}, hook, sheet));

				try {
					const urlMethod = hook.isPostData ? 'post' : 'get';
					const urlData = hook.isPostData ? data : null;
					const urlParams = {json: hook.isJSONResponse};

					promises[promises.length] =
						needleRequest(urlMethod, url, urlData, urlParams)
							.then(response => response.body);
				} catch(err) {
					reject(err);
				}
			});

			resolve(Promise.all(promises));
		});
	};

	function processSheet() {
		if(!current.sheet) {
			current.status = STATUS.IDLE;

			if((++current.id) >= sheets.length) {
				current.id = -1;
				return;
			}

			current.sheet = sheets[current.id];
			processingStartedAt = getTimestamp();
			sendProcessing('...');
		}

		if(current.status===STATUS.BUSY) {
			return current.status = STATUS.BUSY;
		}

		current.status = STATUS.BUSY;

		getSpreadsheet(PROJ, current, (err) => {
			current.sheet.lastFetched = getTimestamp();

			if(err) {
				current.sheet.status = { error: err };
				traceError(err);
			} else {
				var info = current.sheet.info;
				var urlProjectName = encodeURIComponent(`[G2J] Spreadsheet "${current.sheet.projectName}"`);
				var authorName = changeCase.titleCase(info.author.name);

				current.sheet.status = {
					done: `Finished processing the sheet:<br/>`
						+ `<b><a target='_blank' href='${current.sheet.urlSource}'>${info.title}</a></b><br/><br/>`
						+ `Author: <b><a target='_blank' href='mailto:${info.author.email}?Subject=${urlProjectName}'>${authorName}</a></b><br/>`
						+ `Total Sheets: <b>${info.numWorksheets}</b><br/>`
						+ `Date Modified:<br/><b>${info.updated}</b>`
				}
			}

			$$$.sendRefresh(true);

			current.status = STATUS.READY;
			current.sheet = null;
		});
	}

	function getSpreadsheet(PROJ, current, cbOnDone) {
		var sheet = current.sheet;
		var id = getGoogleDocID( sheet.urlSource );

		var gDoc = new GoogleSheet(id);
		var currentInfo = sheet.info;

		var allData = {
			info: _.extend({lastFetched: sheet.lastFetched}, sheet.info),
			sheets: {}
		};

		function crash(err, step) {
			traceError(err);
			return step();
		}

		function reduceCells(cells, cb) {
			//Reduce the column-/row-length to only the necessary (filled) cells:
			for(var c=0; c<cells.length; c++) {
				if(!_.isNullOrEmpty(cells[c])) continue;
				cb(c);
				break;
			}
		}

		function writeSheetToJSON() {
			const __sheetJSON = sheet.__sheetJSON;
			const webhooks = sheet.webhooks = sheet.webhooks || {};
			const hooks = webhooks.hooks;

			$$$.fileWrite(__sheetJSON, JSON.stringify(allData, null, '  '), (err, filename) => {
				if(err) return cbOnDone(err);

				if($$$.slack && webhooks.slackChannel) {
					$$$.slack.sayChannel(webhooks.slackChannel, `*Google-2-JSON*: Updated JSON of project \`${current.sheet.projectName}\``);
				}

				if(!hooks || !hooks.length) {
					return cbOnDone(null);
				}

				var hookData = _.extend({data: allData}, sheet);

				$$$.notifyWebhooks(hookData)
					.then(hookResponses => cbOnDone(null))
					.catch(err => cbOnDone("Failed to notify webhooks: " + err.message || err));
			});
		}

		/////////////////////////////////////////////////////////////////// ^^^^^^^^^^^^^^^^^^

		gDoc.useServiceAccountAuth(PROJ.creds, () => {
			gDoc.getInfo(onWorksheetInfo);
		});

		function onWorksheetInfo(err, info) {
			if(err) {
				if(err.has('403')) {
					return cbOnDone('Error: HTTP error 403 (Forbidden).<br/>Make sure you granted access to your Google Service Email address.');
				}

				return cbOnDone(err);
			}

			if(!PROJ.forceUpdate && currentInfo && currentInfo.updated===info.updated) {
				return cbOnDone(null);
			}

			var totalSheets = info.worksheets.length, progress = 0, rows, cols,
				dataEntries, headers, headersType = [], headersIndicesIgnored;

			current.sheet.info = currentInfo = {
				id: info.id,
				title: info.title,
				updated: info.updated,
				author: info.author,
				numWorksheets: totalSheets
			};

			function doCount(step) {
				progress++;

				if(progress<totalSheets) {
					sendProcessing(progress + '/' + totalSheets);
				} else {
					writeSheetToJSON();
				}

				step();
			}

			var sheetData = {
				_headersRaw: [],
				_headersIndicesIgnored: headersIndicesIgnored = [],
				headers: headers = [],
				data: dataEntries = []
			};

			//Process Multiple Sheet-Tabs simultaneously! :)
			info.worksheets.forEach((worksheet, id) => {
				function countCols(step) {
					rows = Math.min(PROJ.creds.maxRows, worksheet.rowCount);
					cols = Math.min(PROJ.creds.maxCols, worksheet.colCount);

					//First, only query the first row (to determine the max-columns)...
					queryWorksheet(worksheet, 1, 1, cols, 1, (err, cells) => {
						if(err) return crash(err, step);

						reduceCells(cells, c => cols = c);

						processHeaders(cells);

						step();
					});
				}

				function countRows(step) {
					//Second, query only the first COLUMN to reduce the number of rows...
					queryWorksheet(worksheet, 1, 1, 1, rows, (err, cells) => {
						if(err) return crash(err, step);

						reduceCells(cells, r => rows = r);

						step();
					});
				}

				function processHeaders(cells) {
					var regex_invalid_chars = /[^\w \-_]*/g;

					sheetData._headersRaw = cells.slice(0, cols);
					sheetData._headersRaw.forEach((header, id) => {
						if(header.startsWith('//')) {
							return headersIndicesIgnored.push(id);
						}

						if(header.has('[]')) {
							headersType.push('array');
						} else {
							headersType.push('string');
						}

						var headerClean = header.replace(regex_invalid_chars, '').trim();
						headerClean = changeCase.paramCase(headerClean);
						headers.push(headerClean);
					});
				}

				const title = changeCase.paramCase(worksheet.title);

				function processNecessaryCells(step) {
					queryWorksheet(worksheet, 1, 2, cols, rows, (err, cells) => {
						if(err) return crash(err, step);

						var entry, headerID = 0;

						cells.forEach((value, cellID) => {
							var x = cellID % cols;
							//var y = (cellID / cols) >> 0;

							//Skip to next cell!
							if(headersIndicesIgnored.has(x)) return;

							if(x===0) {
								headerID = 0;
								entry = {};
								dataEntries.push(entry);
							}

							var field = headers[headerID];

							entry[field] = encodeURIComponent(value);

							headerID++;
						});

						allData.sheets[title] = _.omit(sheetData);

						step();
					});
				}

				async.series([countCols, countRows, processNecessaryCells, doCount]);
			});
		}

		/////////////////////////////////////////////////////////////////// vvvvvvvvvvvvvvvvv

		function queryWorksheet(worksheet, colStart, rowStart, colEnd, rowEnd, cb) {
			var queryRange = {
				'min-col': colStart,
				'min-row': rowStart,
				'max-col': colEnd,
				'max-row': rowEnd,
				'return-empty': true
			};

			worksheet.getCells( queryRange, (err, cells) => {
				if(err) return cb(err);

				cb(null, cells.map(cell => cell._value));
			});
		}
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