/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev');

module.exports = function(ERDS) {

	//To get the Git info, it requires a few callbacks so call 'onReady' when its done.
	git.branch(branch => {
		git.long(tag => {
			ERDS.git = _.assign(ERDS.git || {}, {
				branch: branch,
				tag: tag
			});
		});
	});

};