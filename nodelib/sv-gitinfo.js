/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev-sync');
const dateFormat = require('dateformat');
const GitHubApi = require("github");

module.exports = function(ERDS, next) {
	var gitDate = git.date();
	var env = process.env;

	ERDS.git = _.assign(ERDS.git || {}, {
		clientID: process.env.GITHUB_CLIENT,
		clientSecret: process.env.GITHUB_SECRET,
		branch: git.branch(),
		long: git.long(),
		short: git.short(),
		tag: git.tag(),
		date: dateFormat(gitDate)
	});

	var github = new GitHubApi({
		// optional
		//debug: true,
		protocol: "https",
		host: "api.github.com", // should be api.github.com for GitHub
		//pathPrefix: "/api/v3", // for some GHEs; none for GitHub
		headers: {
			"user-agent": "BigP Node App" // GitHub is happy with a unique user agent
		},
		Promise: require('bluebird'),
		followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
		timeout: 5000
	});

	github.authenticate({
		type: "token",
		token: env.GITHUB_PERSONAL_TOKEN,
	});

	ERDS.app.use('/github/:user/:repo/:view/:branch', function(req, res, next) {
		//EggRollDigital/aevenavr/tree/vive/ara-vr/Assets/Resources/AudioClips

		var subpath = req.path.substr(1);
		var repoOptions = {
			owner: req.params.user,
			repo: req.params.repo,
			branch: req.params.branch
		};

		github.repos.getBranch(repoOptions).then((response) => {
			var sha = response.data.commit.sha;

			//Return the Cached SHA results:
			// ????

			//Else:

			repoOptions.sha = sha;
			repoOptions.recursive = true;

			github.gitdata.getTree(repoOptions, function(err, response) {
				if(err) {
					traceError(err);
					return next();
				}

				var tree = response.data.tree;
				trace(subpath);
				var files = tree.map(leaf => leaf.path).filter(path => path.has(subpath));
				var jsonStr = JSON.stringify(files, null, '  ');

				res.send(`<pre>${jsonStr}</pre>`);
			});
		}).catch(err => {
			res.send("Error in Github call.");
		});
	});
};