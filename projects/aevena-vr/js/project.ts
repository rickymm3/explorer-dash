declare var ERDS, $, $$$, Vue, trace, traceError, traceClear;

ERDS.Project = class Project {
	constructor() {
		$$$.details = $('#details');
		$$$.views = $$$.details.find('.view');
	}

	extendVue(vueConfig) {
		var projConfig = {
			methods: {
				onDefinableValues() {
					trace("1");
				},
				onLightSequence() {
					trace("1");
				},
				onActionSequence() {
					trace("1");
				},
			}
		};

		return _.merge(vueConfig, projConfig);
	}

	init() {
		ERDS.io.emit('echo', {bla: 1});
		ERDS.io.emit('echo', {bla: 2});
		ERDS.io.emit('echo', {bla: 3});
		//trace($$$.views);

		//Will need "".camelToTitleCase() to convert JSON props to displayable UI fields.
	}

};