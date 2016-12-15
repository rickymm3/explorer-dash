window.addEventListener('load', function() {
	//MAIN ENTRY:
	//..........
});

ERDS.vue = createVue({
	data: function() {
		return {projects: []};
	},
	methods: {
		projectsUpdated: function(data) {
			this.projects = data;
		}
	}
});

bindVueMethodsToSocketIO(ERDS.vue, ERDS.io);

function bindVueMethodsToSocketIO(vue, io) {
	_.keys(vue).forEach(function(propName) {
		var firstChar = propName.substr(0,1);
		if("_$".contains(firstChar)) return;
		
		if(_.isFunction(vue[propName])) {
			bindSocketEvent(vue, vue[propName], propName);
		}
	});

	function bindSocketEvent(vue, method, propName) {
		io.on(propName, method);
	}
}


