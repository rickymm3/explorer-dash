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
	
	function isBusy(cmd, status) {
		cmd.client.emit('isBusy', status);
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
			ERDS.fileWrite(jsonPath, cmd.params, (err) => {
				if(err) {
					isBusy(cmd, false);
					return ERDS.sendServerError(cmd.client, "Could not write JSON file!");
				}
				
				echo(cmd, 'JSON data saved to the server! <i class="em em---1"></i>');
			});
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
				"White",
				"Green",
				"Blue",
				"Red"
			].toKeyValues(),

			AudioClips: [
				"Off",
				"BeepHigh",
				"Blip",
				"Boop",
				"Chime",
				"MenuSelect",
				"SineUp",
				"SineUp2",
				"Sonar",
				"ToneBeep",
				"ToneBeepSloLow",
				"TriToneDown",
				"TriToneUp",
				"UpFlutter",
				"UpwardBeep"
			].toKeyValues(),

			LightStates: [
				"Colors",
				"Off",
				"Full",
				"FadeIn",
				"FadeOut"
			].toKeyValues()
		}
	}
};