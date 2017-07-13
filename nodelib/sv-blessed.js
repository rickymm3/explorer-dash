/**
 * Created by Chamberlain on 12/07/2017.
 */
const blessed = require('blessed');

module.exports = function($$$) {

	return;

	const screen = blessed.screen({smartCSR: true});

	screen.title = "ERDS Web Dashboard";
	screen.key(['escape', 'q', 'C-c'], function(ch, key) {
		return process.exit(0);
	});

	var boxes = {};

	$$$.blessed = {
		_isDirty: false,

		init() {
			//traceClear();
			trace("???");
			//Swap the trace/traceClear methods with this setup:
			//global.trace = this.log.bind(this);
			//global.traceClear = this.clear.bind(this);

			this.createBox('main', {tags: false, padding: 0});
			this.createBox('title', {height: 1, content: '{center}ERDS Web Dashboard{center}'});

			//this.createBox('default', {top: 1});

			this.log("Hi!");
		},

		createBox(name, opts) {
			var box = blessed.box(_.extend({
				top: 0,
				left: 0,
				fg: 'white',
				//bg: 'darkgray',
				width: '100%',
				height: '90%',
				padding: 1,
				tags: true,
			}, opts));


			boxes[name] = {box: box, text: box.getContent() || ''};

			console.log(boxes[name].text);

			screen.append(box);

			return box;
		},

		log(msg, panelName) {
			if(!panelName) panelName = 'default';
			if(!boxes[panelName]) return;

			boxes[panelName].text += msg + "\n";

			this.dirty();
		},

		clear() {
			texts.default = '';
		},

		dirty() {
			if(this._isDirty) return;
			this._isDirty = true;
			process.nextTick(() => this.render());
		},

		render() {
			this._isDirty = false;

			_.keys(boxes).forEach(boxName => {
				var boxObj = boxes[boxName];
				trace(boxName);
				boxObj.box.setContent(boxObj.text);
			});

			screen.render();
		}
	};

	$$$.blessed.init();
};