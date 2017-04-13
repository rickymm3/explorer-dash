/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev-sync');
const dateFormat = require('dateformat');
const scrapy = require('node-scrapy');
const request = require('request');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
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
			repoOptions.sha = response.data.commit.sha;
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



		// var url = 'https://github.com'+req.path;
		// var model = '.file-wrap .content .js-navigation-open';
		// var options = {
		// 	requestOptions: {
		// 		form:{
		// 			client_id: env.GITHUB_OAUTH_CLIENT_ID,
		// 			client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
		// 			access_token: env.GITHUB_OAUTH_TOKEN
		// 		}
		// 	}
		// };
		//
		// scrapy.scrape(url, model, options, function(err, data) {
		// 	if (err) {
		// 		traceError("error! " + err.response.statusCode);
		// 		//trace(err.toString().substr(0, 250));
		// 		var jsonStr = JSON.stringify(options, null, "  ");
		// 		return res.send(err.response.body + `  <pre>${jsonStr}</pre>` ); //res.send(err);
		// 	}
		//
		// 	res.json(data);
		// });
	});

	/*
	ERDS.app.use('/github/', function(req, res, next) {
		var url = 'https://github.com'+req.path;
		var model = '.file-wrap .content .js-navigation-open';
		var options = {
			requestOptions: {
				form:{
					client_id: env.GITHUB_OAUTH_CLIENT_ID,
					client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
					access_token: env.GITHUB_OAUTH_TOKEN
				}
			}
		};

		scrapy.scrape(url, model, options, function(err, data) {
			if (err) {
				traceError("error! " + err.response.statusCode);
				//trace(err.toString().substr(0, 250));
				var jsonStr = JSON.stringify(options, null, "  ");
				return res.send(err.response.body + `  <pre>${jsonStr}</pre>` ); //res.send(err);
			}

			res.json(data);
		});
	});


	const URL_AUTHORIZE = "https://github.com/login/oauth/authorize";
	const URL_ACCESS_TOKEN = "https://github.com/login/oauth/access_token";
	const GithubStrategy = require('passport-github').Strategy;
	const express = ERDS.express;
	const access = {};

	var options = {
		clientID: env.GITHUB_OAUTH_CLIENT_ID,
		clientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
		callbackURL: 'http://localhost:9999/auth/github-callback',
		userAgent: 'BigP Node App',
		scope: 'user repo public_repo repo:status read:repo_hook read:org read:public_key'
	};

	ERDS.app.use(cookieParser());
	ERDS.app.use(session({secret: 'mysecret'}));
	ERDS.app.use(passport.initialize());
	ERDS.app.use(passport.session());

	function setupPassport() {
		passport.use(new GithubStrategy(options, function(accessToken, refreshToken, profile, done) {
			access.token = accessToken;
			access.refresh = refreshToken;
			access.profile = profile;

			trace(access);

			done(null,  {
				accessToken: accessToken,
				profile: profile
			});
		}));

		passport.serializeUser(function(user, done) {
			// for the time being tou can serialize the user
			// object {accessToken: accessToken, profile: profile }
			// In the real app you might be storing on the id like user.profile.id
			done(null, user);
		});

		passport.deserializeUser(function(user, done) {
			// If you are storing the whole user on session we can just pass to the done method,
			// But if you are storing the user id you need to query your db and get the user
			//object and pass to done()
			done(null, user);
		});
	}

	ERDS.app.use('/auth/github', (req, res, next) => {
		trace(options);

		passport.authenticate('github', (err, user, info) => {
			trace("GOT HERE!");
			if(err) return res.send("Error: " + JSON.stringify(err));
			if(info) return res.send("Info: " + JSON.stringify(info));
			return res.send(user);
		})(req, res, next);
	});

	ERDS.app.use('/auth/github-callback', function(req, res, next) {
		trace(req.query);

		var newOptions = {
			code: req.query.code,
			client_id: options.clientID,
			client_secret: options.clientSecret
		};

		request.post(URL_ACCESS_TOKEN, {form: newOptions}, function(err, response, body) {
			if(err) return res.send("Error sending access_token request! " + err);
			//res.send('<pre>' + JSON.stringify(response) + '</pre>');
			res.send(body);
		});
	});
	*/
};