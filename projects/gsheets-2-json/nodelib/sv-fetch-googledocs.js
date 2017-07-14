/**
 * Created by Chamberlain on 11/07/2017.
 */

const GoogleSheet = require('google-spreadsheet');
const async = require('async');
const dateFormat = require('dateformat');
const changeCase = require('change-case');


const STATUS = { IDLE: 0, READY: 1, BUSY: 2 };

module.exports = function(PROJ) {

	var $$$ = PROJ.$$$;
	var app = $$$.app;
	var intervals = [3000, 3000, 3000];

	var current = null;
	var processingStartedAt = null;
	var sheets;

	$$$.startFetching = function(forceUpdate) {
		if(PROJ._status) return;

		PROJ.forceUpdate = forceUpdate;

		trace(("Starting Server..." + (forceUpdate ? ' (FORCED)' : '')).green);
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

	//setTimeout(() => $$$.startFetching(true), 2000);

	function sendRefresh(isRewritingJSON) {
		var refreshData = _.extend({status: !!PROJ._status}, PROJ.jsonData);
		$$$.io.emit('g2j-refresh', refreshData);

		isRewritingJSON && $$$.rewriteJSON();
	}

	$$$.sendRefresh = sendRefresh;

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

		sendRefresh(true);
	}

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
			//trace("   busy ...");
			return current.status = STATUS.BUSY;
		}

		trace(`Started sheet (${current.id+1}/${sheets.length}) ${current.sheet.urlAlias}`.green);

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

			sendRefresh(true);

			trace("Done!".yellow);

			if($$$.slack) {
				//$$$.slack.sayUser("chamberlainpi", `\`Google-2-JSON\` Updated JSON of project *${current.sheet.projectName}*`);
				$$$.slack.sayChannel("notifications", `*Google-2-JSON*: Updated JSON of project \`${current.sheet.projectName}\``);
			}

			current.status = STATUS.READY;
			current.sheet = null;
		});
	}

	function getSpreadsheet(PROJ, current, cbOnDone) {
		var sheet = current.sheet;
		var id = getGoogleDocID( sheet.urlSource );

		var gDoc = new GoogleSheet(id);
		var worksheets;
		var currentInfo = sheet.info;
		var rows, cols;

		var allData = {
			info: _.extend({lastFetched: sheet.lastFetched}, sheet.info),
			sheets: {}
		};

		/////////////////////////////////////////////////////////////////// ^^^^^^^^^^^^^^^^^^

		gDoc.useServiceAccountAuth(PROJ.creds, getInfoAndWorksheets);

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
			trace(` ... Writing JSON file: ` + `./${sheet.urlAlias}.json`.green);

			var __sheetJSON = $$$.getPathSheetJSON(sheet.urlAlias);
			$$$.fileWrite(__sheetJSON, _.jsonPretty(allData), (err, filename) => {
				if(err) return cbOnDone(err);
				cbOnDone(null);
			});
		}

		function getInfoAndWorksheets() {
			gDoc.getInfo((err, info) => {
				if(err) {
					if(err.has('403')) {
						return cbOnDone('Error: HTTP error 403 (Forbidden).<br/>Make sure you granted access to your Google Service Email address.');
					}

					return cbOnDone(err);
				}

				if(!PROJ.forceUpdate && currentInfo && currentInfo.updated===info.updated) {
					return cbOnDone(null);
				}

				var totalSheets = info.worksheets.length;
				current.sheet.info = currentInfo = {
					id: info.id,
					title: info.title,
					updated: info.updated,
					author: info.author,
					numWorksheets: totalSheets
				};

				var sheetData, headers, headersType, headersIndicesIgnored, dataEntries;

				//Process each worksheets:
				AsyncEach.make(info.worksheets, [
					(step, worksheet, id) => {
						sendProcessing((id+1) + '/' + totalSheets);
						rows = Math.min(PROJ.creds.maxRows, worksheet.rowCount);
						cols = Math.min(PROJ.creds.maxCols, worksheet.colCount);

						headersType = [];
						sheetData = {
							_headersRaw: [],
							_headersIndicesIgnored: headersIndicesIgnored = [],
							headers: headers = [],
							data: dataEntries = []
						};

						//First, only query the first row (to determine the max-columns)...
						queryWorksheet(worksheet, 1, 1, cols, 1, (err, cells) => {
							if(err) return crash(err, step);

							reduceCells(cells, c => cols = c);

							var regex_invalid_chars = /[^\w \-_]*/g;
							var regex_to_hyphens = /[ _]+/g;

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

							step();
						});
					},

					(step, worksheet) => {
						//Second, query only the first COLUMN to reduce the number of rows...
						queryWorksheet(worksheet, 1, 1, 1, rows, (err, cells) => {
							if(err) return crash(err, step);

							reduceCells(cells, r => rows = r);

							step();
						});
					},

					(step, worksheet) => {
						trace(` ... Fetching: ` + `"${worksheet.title}" (${cols}x${rows})`.cyan);

						queryWorksheet(worksheet, 1, 2, cols, rows, (err, cells) => {
							if(err) return crash(err, step);

							var entry, headerID = 0;

							cells.forEach((value, cellID) => {
								var x = cellID % cols;
								var y = (cellID / cols) >> 0;

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

							allData.sheets[changeCase.paramCase(worksheet.title)] = _.omit(sheetData);

							step();
						});
					}
				], writeSheetToJSON);
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

			var cols = colEnd - colStart + 1;
			var rows = rowEnd - rowStart + 1;

			var total = cols * rows;

			//trace(`Fetching ${cols}x${rows} cells (total: ${total})...`.cyan);

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


// function processFirstRow(worksheet, cells) {
// 	for(var c=0; c<worksheet.colCount; c++) {
// 		var cell = cells[c];
// 		if(cell._value=='') {
// 			//trace(worksheet.headers.join(", "));
// 			processOtherRows(cells, worksheet.colCount, c);
// 			return;
// 		}
//
// 		var trimmed = customTrim(cell._value, '_ \\-\\[\\]"\\\'\\{\\}');
// 		if(cell._value.indexOf('_')==0) {
// 			skippedCols[cell.col] = true;
// 			report.red(" -- Ignoring column: " + cell._value);
// 		} else if(cell._value!=trimmed) {
// 			report.yellow(" -- Modified column '%s' to '%s'.", [cell._value,trimmed])
// 			if(cell._value.indexOf("{}")>-1) {
// 				hasElementsCols[cell.col] = true;
// 			}
// 		}
//
// 		worksheet.headersRaw.push(cell._value);
// 		worksheet.headers.push(trimmed);
// 	}
// }