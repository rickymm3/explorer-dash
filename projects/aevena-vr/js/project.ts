declare var ERDS, Vue, trace, traceError, traceClear;

ERDS.Project = class Project {

	constructor() {
		ERDS.io.emit("echo", {foo: 'bar'});

		setTimeout(function() {
			ERDS.io.emit("echo", "Hello World");
		}, 2000);

		ERDS.vue = new Vue({
			el: '#details',
			data: {

			}
		});

		//Will need "".camelToTitleCase() to convert JSON props to displayable UI fields.
	}

	init() {
		trace("Init this...");
	}

};