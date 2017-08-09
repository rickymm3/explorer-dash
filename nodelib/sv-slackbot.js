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

	function status500(res, err) {
		if(!err) err = 'Internal Server Error';
		res.status(500).send(err)
	}

	function isDirectMessage(body) {
		return body.channel_name==="directmessage";
	}

	$$$.slack = {
		sayChannel(channel, msg) {
			bot.postMessageToChannel(channel, msg, messageParams);
		},
		sayUser(user, msg) {
			bot.postMessageToUser(user, msg, messageParams);
		},
		say(body, msg) {
			if(!body) {
				return traceError("Slack.say missing body object.");
			}

			if(isDirectMessage(body)) {
				this.sayUser(body.user_name, msg);
			} else {
				this.sayChannel(body.channel_name, msg);
			}
		}
	};

	$$$.app.post('/erds-bot/slash', (req, res, next) => {
		if(req.body.token!=process.env.SLACK_SLASH_TOKEN) {
			return status500(res, 'Invalid Slash Token. May not have permission to use this slackbot!');
		}

		var slashSplit = req.body.text.split(' ');
		var command = slashSplit.shift();

		if(!SlackCommands[command]) {
			return status500(res, `Invalid /erds command! Make sure you spelled it correctly!`);
		}

		$$$.slack.sayUser('chamberlainpi', 'Someone slashed me: ' + req.body.text);

		SlackCommands[command](slashSplit, req.body);

		res.status(200).send();
	});

	var timeouts = -1;

	function startAuto(msg, body, mins, cb) {
		stopAuto();

		var time = 1000 * 60 * mins; //X-minutes;

		timeouts = setTimeout(cb, time);

		$$$.slack.say(body, msg + ` Will auto-stop in ${mins} mins.`);
	}

	function stopAuto() {
		if(timeouts>-1) clearTimeout(timeouts);
		timeouts = -1;
	}

	const SlackCommands = {
		'start-g2j'(args, body) {
			$$$.startFetching();

			startAuto(`:arrow_forward: *Started* the Google-2-JSON process`, body, 10, () => {
				SlackCommands['stop-g2j'](args, body);
			})
		},
		'stop-g2j'(args, body) {
			stopAuto();

			$$$.stopFetching();

			$$$.slack.say(body, ":no_entry_sign: *Stopped* the Google-2-JSON process.");
		}
	}

	/*
	 {"token":"YGvGtQnnWMIpEwQMOU4wVH1w","team_id":"T19GTBA6Q","team_domain":"eggrolldigital","channel_id":"D4J7QTUUR","channel_name":"directmessage","user_id":"U19GU51AQ","user_name":"chamberlainpi","command":"/erds","text":"start-g2j","response_url":"https://hooks.slack.com/commands/T19GTBA6Q/213130197939/aZChkJXBX3l7dof8vVxz94Z0"}


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