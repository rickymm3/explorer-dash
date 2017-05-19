/**
 * Created by chamberlainpi on 2017-02-07.
 */
const fs = require('fs');

module.exports = function(PROJ) {
	trace("Aevena JSON!");
	
	var $$$ = PROJ.$$$;
	var io = $$$.io;
	var clearCommandFlag = -1;
	
	function echo(cmd, msg) {
		cmd.client.emit('echo', msg);
		isBusy(cmd, false);
	}

	function echoAll(msg) {
		$$$.io.emit('echo', msg);
	}
	
	function isBusy(cmd, status) {
		io.emit('isBusy', status);
	}

	function checkFileCount(jsonPath, eventName) {
		var pathinfo = jsonPath.toPath();
		var count = 0;
		$$$.filesFilter(pathinfo.path, file => count++);

		if(count>30) {
			$$$.io.emit(eventName, count);
		}
	}
	
	PROJ.commands = {
		clearJSON(cmd) {
			if(!$$$.fileExists(cmd.proj.__json)) {
				isBusy(cmd, false);
				return $$$.sendServerError(cmd.client, "The JSON does not even exists, therefore it can't be deleted!");
			}
			
			if(clearCommandFlag===-1) {
				echo(cmd, 'Are you sure you want to clear the data?<br/>:--1: CTRL Click Again<br/>:-1: Wait 4s and forget about it!');
				
				//Shut the clear flag back off shortly if it's never re-executed
				return clearCommandFlag = setTimeout(() => {
					clearCommandFlag = -1;

					echo(cmd, 'Aborted JSON clearing.');
				}, 4000);
			}
			
			clearTimeout(clearCommandFlag);

			$$$.fileRename(cmd.proj.__json, cmd.proj.__json+'.bak', (err) => {
				if(err) {
					isBusy(cmd, false);
					return $$$.sendServerError(cmd.client, "Failed backing up JSON file!");
				}
				
				echo(cmd, 'Alright, clearing up the data completed!');
			})
		},
		
		saveJSON(cmd) {
			isBusy(cmd, true);
			var jsonPath = cmd.proj.__json;
			$$$.makeDir(jsonPath);
			
			if($$$.fileExists(jsonPath)) {
				return $$$.fileCopyNow(jsonPath, doSave);
			}
			
			doSave();
			
			function doSave(err) {
				if(err) {
					throw err;
				}

				var jsonData = JSON.parse(cmd.params);

				$$$.fileWrite(jsonPath, _.jsonPretty(jsonData, "\t"), (err) => {
					if(err) {
						isBusy(cmd, false);
						return $$$.sendServerError(cmd.client, "Could not write JSON file!");
					}

					var clientIp = cmd.client.request.connection.remoteAddress.split(':').pop();

					io.emit('saved', `JSON data saved to the server! from client: {IP: ${clientIp}} <i class="twn twn-bounce em em---1"></i>`);
					isBusy(cmd, false);

					checkFileCount(jsonPath, "has-many-backups");
				});
			}
		},

		recoverJSON(cmd) {
			var bak = cmd.proj.__json+'.bak';
			
			if(!$$$.fileExists(bak)) {
				isBusy(cmd, false);
				return $$$.sendServerError(cmd.client, "Could not locate Backup JSON file! :-1:");
			}
			
			$$$.fileRename(bak, cmd.proj.__json, (err) => {
				if(err) {
					isBusy(cmd, false);
					return $$$.sendServerError(cmd.client, "Failed renaming Backup JSON file!");
				}

				echo(cmd, 'Backup recovered!');
			})
		},

		getHardcoded(cmd) {
			var hardcodedData = $$$.requireNoCache(cmd.proj.__data + "/hardcoded.js");

			cmd.client.emit('hardcoded', {hardcoded: hardcodedData});
		},

		getEditFile(cmd) {
			$$$.fileRead(cmd.proj.__data + "/" + cmd.params, (err, content, file) => {
				if(err) return $$$.sendServerError(cmd.client, "Error opening file: " + file);
				cmd.client.emit('edit-file', {name: file, data: content});
				isBusy(cmd, false);
			});
		},

		saveEditFile(cmd) {
			var name = cmd.params.name.replace(cmd.proj.__data, '');
			echo(cmd, "Saving file... " + name);
			$$$.fileWrite(cmd.proj.__data + name, cmd.params.data, (err, file) => {
				if(err) return $$$.sendServerError(cmd.client, "Error writing file: " + file);

				cmd.client.emit('edit-file', null);

				if(name.has('hardcoded')) {
					PROJ.commands.getHardcoded(cmd);
				}

				isBusy(cmd, false);
			})
		},

		onJSONParams(cmd) {
			if(!cmd.res) return traceError("Missing cmd.res reference!");

			var jsonData = JSON.parse(cmd.content);

			var whichSheet = cmd.params[0].toLowerCase();

			var __SHEET = null;
			jsonData.sheets.forEach(sheet => {
				var sheetName = sheet.name.toLowerCase();
				if(sheetName!==whichSheet) return;

				__SHEET = sheet;
			});

			if(!__SHEET) {
				return $$$.status500(cmd.res, "Sheet not found: " + whichSheet);
			}

			var sheetJSON = {
				sheetRequested: __SHEET.name,
				sheets: [__SHEET]
			};

			$$$.sendJSON(cmd.res, _.jsonPretty(sheetJSON));

			// if(cmd.res) {
			// 	cmd.res.send("Hey you are here! " );
			// }
		}
	};

	// var responseData = PROJ.responseData;
	//
	// if(responseData) {
	// 	//responseData.hardcoded =
	// }
};