/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev-sync');

module.exports = function(ERDS, next) {
	ERDS.git = _.assign(ERDS.git || {}, {
		clientID: process.env.GITHUB_CLIENT,
		clientSecret: process.env.GITHUB_SECRET,
		branch: git.branch(),
		tag: git.long()
	});
};