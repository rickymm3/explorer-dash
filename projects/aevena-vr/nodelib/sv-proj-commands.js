/**
 * Created by chamberlainpi on 2017-02-07.
 */
const fs = require('fs');

module.exports = function(PROJ) {
	trace("Aevena JSON!");
	
	var ERDS = PROJ.ERDS;
	var clearCommandFlag = -1;
	
	function echo(cmd, msg) {
		cmd.client.emit('echo', msg);
		isBusy(cmd, false);
	}

	function echoAll(msg) {
		ERDS.io.emit('echo', msg);
	}
	
	function isBusy(cmd, status) {
		cmd.client.emit('isBusy', status);
	}

	function checkFileCount(jsonPath) {
		var pathinfo = jsonPath.toPath();
		var count = 0;
		ERDS.filesFilter(pathinfo.path, (file) => {
			count++;
		});

		if(count>30) {
			ERDS.io.emit("has-many-backups", count);
		}
	}
	
	PROJ.commands = {
		clearJSON(cmd) {
			if(!ERDS.fileExists(cmd.proj.__json)) {
				isBusy(cmd, false);
				return ERDS.sendServerError(cmd.client, "The JSON does not even exists, therefore it can't be deleted!");
			}
			
			if(clearCommandFlag==-1) {
				echo(cmd, 'Are you sure you want to clear the data?<br/>:--1: CTRL Click Again<br/>:-1: Wait 4s and forget about it!');
				
				//Shut the clear flag back off shortly if it's never re-executed
				return clearCommandFlag = setTimeout(() => {
					clearCommandFlag = -1;

					echo(cmd, 'Aborted JSON clearing.');
				}, 4000);
			}
			
			clearTimeout(clearCommandFlag);

			ERDS.fileRename(cmd.proj.__json, cmd.proj.__json+'.bak', (err) => {
				if(err) {
					isBusy(cmd, false);
					return ERDS.sendServerError(cmd.client, "Failed backing up JSON file!");
				}
				
				echo(cmd, 'Alright, clearing up the data completed!');
			})
		},
		
		saveJSON(cmd) {
			var jsonPath = cmd.proj.__json;
			ERDS.makeDir(jsonPath);
			
			if(ERDS.fileExists(jsonPath)) {
				return ERDS.fileCopyNow(jsonPath, doSave);
			}
			
			doSave();
			
			function doSave(err) {
				if(err) {
					throw err;
				}

				var jsonData = JSON.parse(cmd.params);

				ERDS.fileWrite(jsonPath, _.jsonPretty(jsonData, "\t"), (err) => {
					if(err) {
						isBusy(cmd, false);
						return ERDS.sendServerError(cmd.client, "Could not write JSON file!");
					}

					var clientIp = cmd.client.request.connection.remoteAddress.split(':').pop();

					echoAll(`JSON data saved to the server! from client: ${clientIp} <i class="em em---1"></i>`);

					checkFileCount(jsonPath);
				});
			}
		},

		recoverJSON(cmd) {
			var bak = cmd.proj.__json+'.bak';
			
			if(!ERDS.fileExists(bak)) {
				isBusy(cmd, false);
				return ERDS.sendServerError(cmd.client, "Could not locate Backup JSON file! :-1:");
			}
			
			ERDS.fileRename(bak, cmd.proj.__json, (err) => {
				if(err) {
					isBusy(cmd, false);
					return ERDS.sendServerError(cmd.client, "Failed renaming Backup JSON file!");
				}

				echo(cmd, 'Backup recovered!');
			})
		}
	};

	var responseData = PROJ.responseData;

	if(responseData) {
		responseData.hardcoded = {
			AraCommands: [
				"TakeOff",
				"Fly Straight",
				"Dock",
				"Go To Dock",
				"Find User",
				"Patrol",
				"PatrolShort",
				"Waiting",
				"TurnNE",
				"TurnE",
				"TurnSE",
				"TurnS",
				"TurnNW",
				"TurnW",
				"TurnSW",
				"SleepLowBatt",
				"SleepHalfBatt",
				"SleepMostBatt",
				"SleepFullBatt",
				"Ready",
				"Error Minor",
				"Error Standard",
				"Error Critical",
				"Battery Low",
				"Obstacle In Path",
				"Task In Progress",
				"Thinking",
				"Changing Task",
				"Camera On"
			].toKeyValues(),

			Colors: [
				"#fff", //white
				"#f00", //red
				"#f80", //orange
				"#ff0", //yellow
				"#0f0", //green
				"#084", //forestgreen
				"#888", //gray
				"#0ff", //cyan
				"#08f", //skyblue
				"#00f", //blue
				"#80f", //purple
				"#f0f", //magenta
			].toKeyValues(),

			AudioClips: [
				'Off',
				'startup',
				'battery low',
				'camera off',
				'camera on',
				'changing task',
				'docking',
				'error',
				'find user',
				'fly to dock',
				'obstacle in course',
				'pairing completed',
				'pairing started',
				'patrol short',
				'patrol',
				'ready',
				'setup complete',
				'starting to charge',
				'take off',
				'task in progress',
				'thinking',
				'waiting'
			].toKeyValues(),

			LightStates: [
				"Colors",
				"Off",
				"Full",
				"Half",
				"Quarter",
				"FadeOn",
				"FadeOff",
				"FadeHalf"
			].toKeyValues(),

			WebPanels: [
				"downloadapp",
				"openapp",
				"choosebluetooth",
				"completebluetooth",
				"startwifi",
				"choosewifinetwork",
				"setwifipassword",
				"connectwifi",
				"wificonnected",
				"spacecheck",
				"testflight",
				"flightinprogress",
				"setupcomplete",
				"loadingpage",
				"intropage"
			].toKeyValues(),

			TriggerNames: [
				"AppStoreClick",
				"HomeScreenClick",
				"BluetoothPairedClick",
				"WifiSetupClick",
				"WifiChooseNetworkClick",
				"WifiSubmitPasswordClick",
				"WifiConnectedClick",
				"TestFlightLaunchClick",
				"SetupCompleteClick",
				"LoadingPageClick",
				"IntroPageClick"
			].toKeyValues()
		}
	}
};