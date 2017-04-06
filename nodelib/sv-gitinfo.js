/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev-sync');
const dateFormat = require('dateformat');

module.exports = function(ERDS, next) {
	
	var gitDate = git.date();
	
	ERDS.git = _.assign(ERDS.git || {}, {
		clientID: process.env.GITHUB_CLIENT,
		clientSecret: process.env.GITHUB_SECRET,
		branch: git.branch(),
		long: git.long(),
		short: git.short(),
		tag: git.tag(),
		date: dateFormat(gitDate)
	});

};