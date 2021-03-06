/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev-sync');
const dateFormat = require('dateformat');
const GitHubApi = require('github');
const anymatch = require('anymatch');
const bodyParser = require('body-parser');

module.exports = function($$$, next) {
	var gitDate = git.date();
	var env = process.env;

	$$$.git = _.assign($$$.git || {}, {
		clientID: process.env.GITHUB_CLIENT,
		clientSecret: process.env.GITHUB_SECRET,
		branch: git.branch(),
		long: git.long(),
		short: git.short(),
		tag: git.tag(),
		date: dateFormat(gitDate)
	});

	var github = new GitHubApi({
		//debug: true, // optional
		protocol: "https",
		host: "api.github.com", // should be api.github.com for GitHub
		//pathPrefix: "/api/v3", // for some GHEs; none for GitHub
		headers: { "user-agent": "BigP Node App" }, // GitHub is happy with a unique user agent
		Promise: require('bluebird'),
		followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
		timeout: 5000
	});

	github.authenticate({ type: "token", token: env.GITHUB_PERSONAL_TOKEN });

	var __githubListingsJSON = $$$.__private + "/github-listings.json";
	var githubListings = {repos:{}};

	if($$$.fileExists(__githubListingsJSON)) {
		githubListings = $$$.jsonRead(__githubListingsJSON);
	}

	//$$$.path
	$$$.app.use('/github/:user/:repo/:view/:branch', function(req, res, next) {
		var p = req.params;
		var sha = null, commit = null;
		var fullURL = $$$.fullUrl(req);
		var uniqueID = [p.user,p.repo,p.branch].join(':');
		var subpath = req.path.substr(1);
		var repoOptions = {
			owner: p.user,
			repo: p.repo,
			branch: p.branch
		};

		var reposKnown = githubListings.repos;
		var repoCurrent = reposKnown[uniqueID];
		if(!repoCurrent) reposKnown[uniqueID] = repoCurrent = {sha:null, comment:'', tree:null};

		github.repos.getBranch(repoOptions).then(onGetBranch).catch(err => {
			res.send("Error in Github call: " + err);
		});

		function onGetBranch(response) {
			sha = response.data.commit.sha;

			var tempCommit = response.data.commit.commit;
			commit = {
				commiter: tempCommit.committer,
				message: tempCommit.message
			};

			if(repoCurrent.sha==sha) {
				return onOutputTreeData(repoCurrent);
			}

			repoCurrent.commit = commit;
			repoOptions.sha = repoCurrent.sha = sha;
			repoOptions.recursive = true;

			//github.repos.getCommitComment({owner: p.user, repo: p.repo, id: sha}, onGetCommitComment);
			github.gitdata.getTree(repoOptions, onGetNewTreeData);
		}

		// function onGetCommitComment(err, response) {
		// 	if(err) {
		// 		traceError("Error getting commit comment: " + err);
		// 		return next();
		// 	}
		//
		// 	commit = response;
		// 	trace(commit);
		// 	return res.send('...');
		// 	//
		// }

		function onGetNewTreeData(err, response) {
			if(err) {
				traceError(err);
				return next();
			}

			repoCurrent.tree = response.data.tree;

			onOutputTreeData(repoCurrent);

			$$$.jsonWrite(__githubListingsJSON, githubListings, (err, file) => {
				if(err) return traceError("Failed to write JSON in private folder!");
				trace("JSON written successfully!".green);
			});
		}

		function onOutputTreeData(repo) {
			var q = req.query;
			var subpathSlash = subpath+'/';
			var files = repo.tree.map(leaf => leaf.path).filter(path => path.has(subpath));
			if(q.exclude) files = files.filter(file => !anymatch(q.exclude.split(','), file));
			if(q.include) files = files.filter(file => anymatch(q.include.split(','), file));
			if(!q.dirs) files = files.filter(file => file.split('/').pop().has('.'));
			if(q.nometa!=null) files = files.filter(file => !anymatch('**/*.meta', file));
			if(q.trim!=null && subpath.length>0) files = files.map(file => file.replace(subpathSlash, ''));
			if(q.noext!=null) files = files.map(file => file.replace(/\.[a-z0-9]*$/i, ''));
			//?noext&trim&exclude=**/*.meta

			var jsonData = {
				sha: sha,
				queries: q,
				commit: repoCurrent.commit,
				uniqueID: uniqueID,
				subpath: subpath,
				files: files
			};

			if(q.pretty!=null) {
				var jsonStr = JSON.stringify(jsonData, null, '  ');
				return res.send(`<pre>${jsonStr}</pre>`);
			}

			res.send(jsonData);
		}
	});

	$$$.app.use('/github-webhook', bodyParser.json(), function(req, res, next) {
		var fullURL = $$$.fullUrl(req);

		trace("github-webhook: " + fullURL);
		$$$.io.emit('github-webhook', req.body);

		return res.send('ok');
	});
};