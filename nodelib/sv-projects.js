module.exports = function ($$$) {
	return {
		getProjectObj(projectName) {
			if (!projectName || !projectName.length) return null;

			var projectPath = $$$.__projects + '/' + projectName;
			var projectData = $$$.__data + '/' + projectName;
			
			if (!$$$.fileExists(projectPath)) {
				traceError("Project does not exists! " + projectName);
				return null;
			}

			return {
				name: projectName,
				__path: projectPath,
				__indexhtml: projectPath + '/index.html',
				__nodelib: projectPath + '/nodelib',
				__js: projectPath + '/js',
				__css: projectPath + '/css',
				__data: projectData,
				__json: projectData + '/data.json'
			};
		}
	}
};