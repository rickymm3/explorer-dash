/**
 * Created by Chamberlain on 15/12/2016.
 */
function mapStringToNameObjects(strings) {
	return _.map(strings, (name) => {return {name: name}});
}

module.exports = function(ERDS) {
	ERDS.getProjectsList = function(cb) {
		ERDS.getDirs(ERDS.__projects, (dirs) => {
			var projects = mapStringToNameObjects(dirs);
			cb(projects);
		});
	};
	
	ERDS.getProjectData = function(projectName, cb) {
		var projectPath = ERDS.__projects + '/' + projectName.toLowerCase();
		
		if(!ERDS.isDir(projectPath)) {
			return cb(new Error("Project does not exists: " + projectName));
		}
		
		var projectIndex = projectPath + '/index.html';
		var projectVues = projectPath; // + '/vue-partials';
		var projectScripts = ERDS.filesFilter(projectPath+'/js', '.js', false).map(shortenScriptURLs);

		function shortenScriptURLs(str) {
			return str.replace(projectPath, '/p/'+projectName);
		}
		
		cb(null, {
			projectPath: projectPath,
			projectName: projectName,
			indexPath: projectIndex,
			vuePartials: projectVues,
			projectScripts: projectScripts
		});
	}
};