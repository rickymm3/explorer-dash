module.exports = function (ERDS) {
	return {
		getProjectObj(projectName) {
			if (!projectName || !projectName.length) return null;

			var projectPath = ERDS.__projects + '/' + projectName;
			var projectData = ERDS.__data + '/' + projectName;
			
			if (!ERDS.fileExists(projectPath)) {
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