const SlackBot = require('slackbots');

/**
 * Created by Chamberlain on 14/07/2017.
 */
module.exports = function($$$) {
	var bot = new SlackBot({
		token: process.env.SLACK_BOT_TOKEN,
		name: 'erds-bot'
	});

	var messageParams = {icon_emoji: ':burrito:'};

	bot.on('start', function() {
		$$$.slack.sayUser('chamberlainpi', 'I started! :)');
	});

	$$$.slack = {
		sayChannel(channel, msg) {
			bot.postMessageToChannel(channel, msg, messageParams);
		},
		sayUser(user, msg) {
			bot.postMessageToUser(user, msg, messageParams);
		}
	};

	$$$.app.post('/erds-bot/slash', (req, res, next) => {
		$$$.slack.sayUser('chamberlainpi', 'Someone slashed me!');
		$$$.slack.sayUser('chamberlainpi', _.jsonPretty(req.params));
		$$$.slack.sayUser('chamberlainpi', _.jsonPretty(req.body));

		res.sendStatus(200);
	});
	/*
	 token=YGvGtQnnWMIpEwQMOU4wVH1w
	 team_id=T0001
	 team_domain=example
	 channel_id=C2147483705
	 channel_name=test
	 user_id=U2147483697
	 user_name=Steve
	 command=/weather
	 text=94070
	 response_url=https://hooks.slack.com/commands/1234/5678
	 */
};