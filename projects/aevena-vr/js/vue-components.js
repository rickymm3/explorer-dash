makeVueComponent("light-sequence", {props:['none']});

/**
 * Created by Chamberlain on 15/12/2016.
 */
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

