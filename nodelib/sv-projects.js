var cachedProject = {};

module.exports = function ($$$) {
	return {
		getProjectObj(projectName) {
			if (!projectName || !projectName.length) return null;

			if(cachedProject[projectName]) return cachedProject[projectName];

			var projectPath = $$$.__projects + '/' + projectName;
			var projectData = $$$.__data + '/' + projectName;
			
			if (!$$$.fileExists(projectPath)) {
				traceError("Project does not exists! " + projectName);
				return null;
			}

			var proj = cachedProject[projectName] = {
				$$$: $$$,
				name: projectName,
				__path: projectPath,
				__indexhtml: projectPath + '/index.html',
				__nodelib: projectPath + '/nodelib',
				__js: projectPath + '/js',
				__css: projectPath + '/css',
				__data: projectData,
				__json: projectData + '/data.json'
			};

			$$$.hideProperties(proj, "$$$");

			//Load specific project's modules:
			if($$$.fileExists(proj.__nodelib)) {
				$$$.loadModules(proj.__nodelib, proj, true); //$$$.isDev
			} else {
				traceError("No /nodelib/ folder found for project: \n" + proj.__nodelib);
			}

			return proj;
		}
	}
};