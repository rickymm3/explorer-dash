/**
 * Created by chamberlainpi on 2017-02-07.
 */

module.exports = function(PROJ) {
	trace("Aevena JSON!");

	PROJ.commands = {
		clearJSON() {
			ERDS.io.emit();
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