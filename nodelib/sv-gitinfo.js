/**
 * Created by Chamberlain on 16/12/2016.
 */

const git = require('git-rev');

var gitInfo = {branch:null, tag:null};

module.exports = function(ERDS, cb) {
	//To get the Git info, it requires a few callbacks so call 'onReady' when its done.
	git.branch(branchName => {
		git.long(longTag => {
			gitInfo.branch = branchName;
			gitInfo.tag = longTag;
			
			ERDS.git = gitInfo;

			//Alright! Ready for lift-off!
			cb();
		});
	});
	
	return gitInfo;
};