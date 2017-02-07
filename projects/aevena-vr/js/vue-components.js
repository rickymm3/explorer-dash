//TODO is this an issue?
makeVueComponent("light-sequence", {props:['none']});

createVue(function(vue) { ERDS.vueProject = vue; }, {
	el: "#vue-project",
	data: function() {
		return {
			lightSequences: [{a:0}, {a:1}, {a:2}, {a:3}]
		}
	},
	
	created: function() {
		trace("Project Vue created!");
	}
});

