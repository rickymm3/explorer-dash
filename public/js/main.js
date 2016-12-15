window.addEventListener('load', function() {
	//MAIN ENTRY:
	
	var $csvImporter = $('#csv-importer');

	//ERDS.vue.data.projects = 
	
	ERDS.vue.updateProjects();
});

ERDS.vue = createVue({
	data: function() {
		return {projects: []};
	},
	methods: {
		updateProjects: function() {
			this.projects = [
				{name: "Testing1"},
				{name: "Testing2"}
			];
		}
	}
});


