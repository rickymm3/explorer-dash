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
	}
	
	PROJ.commands = {
		clearJSON(cmd) {
			if(!ERDS.fileExists(cmd.proj.__json)) {
				return ERDS.sendServerError(cmd.client, "The JSON does not even exists, therefore it can't be deleted!");
			}
			
			if(clearCommandFlag==-1) {
				echo(cmd, 'Are you sure you want to clear the data?<br/>(YES = Press Again, NO = Do nothing!)');
				
				//Shut the clear flag back off shortly if it's never re-executed
				return clearCommandFlag = setTimeout(() => {
					clearCommandFlag = -1;

					echo(cmd, 'Aborted JSON clearing.');
				}, 6000);
			}
			
			clearTimeout(clearCommandFlag);
			
			fs.unlink(cmd.proj.__json, (err) => {
				if(err) return ERDS.sendServerError(cmd.client, "Failed removing JSON file!");
				
				echo(cmd, 'Alright, clearing up the data completed!');
			});
		},
		
		saveJSON(cmd) {
			var jsonPath = cmd.proj.__json;
			ERDS.makeDir(jsonPath);
			ERDS.fileWrite(jsonPath, cmd.params, (err) => {
				if(err) return ERDS.sendServerError(cmd.client, "Could not write JSON file!<br/>" + cmd.proj.__json);
				
				echo(cmd, 'JSON data saved to the server! <i class="em em---1"></i>');
			});
		}
	};
	
	
	function defaultData() {
		return {
			definableValues: [
				{type: 'numeric-prop', name: 'photoDistance', value: 5},
				{type: 'numeric-prop', name: 'elevationHeight', value: 1},
				{type: 'numeric-prop', name: 'elevationSpeed', value: 5},
				{type: 'numeric-prop', name: 'descentSpeed', value: 1},
				{type: 'numeric-prop', name: 'movementSpeed', value: 5},
				{type: 'numeric-prop', name: 'yawSpeed', value: 1},
				{type: 'numeric-prop', name: 'timeToStart', value: 5},
				{type: 'numeric-prop', name: 'timeToStop', value: 1},
				{type: 'numeric-prop', name: 'maxTiltRange', value: 5},
				{type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1}
			],

			lightSequence: [
				{type: 'light-item', name: 'Light 1', params: []}
			],
			
			actionSequence: [
				{type: 'action-item', name: 'Action 1', time: 5, params: []}
			]
		};
	}
};