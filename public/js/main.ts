declare var ERDS, Howl, Vue, trace, traceError, io, $, _, TweenMax, Back, Cookies;

var $$$:any = {};

ERDS.isMac = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;

window.addEventListener('load', function() {
	//Vue.config.debug = true;
	Cookies._prefix = "erds.web.";

	ERDS.beep = new Howl({
		src: ['/media/coin.mp3'],
		volume: 0.25
	});

	ERDS.io = io(); //Create a socket connection:
	ERDS.io.on('beep', onBeep);
	ERDS.io.on("echo", response => $$$.boxInfo.showBox(response));
	ERDS.io.on("server-error", response => $$$.boxError.showBox(response));
	ERDS.io.on('file-changed', onFileChanged);
	ERDS.io.on('project-fetch', onProjectFetch);
	ERDS.io.on('has-many-backups', onHasManyBackups);
	ERDS.io.emit('project-fetch', ERDS.projectName);
});

function projectCommand(command, params) {
	ERDS.io.emit('project-command', {
		project: ERDS.projectName,
		dateClient: new Date(),
		command: command,
		params: params
	});
}

function onFileChanged(whichFile) {
	window.location.reload(true);
}

function onProjectFetch(projectData) {
	if(!ERDS.Project) return traceError("Missing ERDS.Project");
	if(ERDS.vue) return traceError("Vue already created!");

	var project = ERDS.project = new ERDS.Project();
	ERDS.vueConfig = {
		el: '#app',
		data: {
			message: 'Test VueJS Message!',
			errors: '',
			infos: ''//,
			//proj: proj
		},
		methods: {}
	};

	if(project.extendVue) {
		ERDS.vueConfig = project.extendVue(ERDS.vueConfig);
	}
	
	ERDS.vue = new Vue(ERDS.vueConfig);

	initializeUI();

	project.init && project.init(projectData);
}

function initializeUI() {
	$$$.boxError = $('.box-error');
	$$$.boxInfo = $('.box-info');
	$$$.boxes = [$$$.boxError,$$$.boxInfo];

	_makeQueueBox($$$.boxInfo, (obj) => {
		ERDS.vue.infos = !_.isString(obj) && _.isObject(obj) ? JSON.stringify(obj) : obj;
	}, 0);

	_makeQueueBox($$$.boxError, (err) => {
		ERDS.vue.errors = _.isString(err) ? err : (err ? err.responseText : "Error...");
	}, 50);

	window.addEventListener('mousedown', function() {
		$$$.boxes.forEach(box => {
			if(!box.is(":visible")) return;
			
			TweenMax.killTweensOf(box);
			TweenMax.to(box, 0.5, {alpha: 0, onComplete: () => {
				box.hide();
			}});
		});
	});

	function _makeQueueBox(box, cbSetInnerHTML, offset=0) {
		box._queueObj = [];
		box._queueBusy = false;
		box._cbSetInnerHTML = cbSetInnerHTML;
		box._offset = offset;
		box.show();

		_initTransforms(box);

		box.showBox = function(msg) {
			this._queueObj.push({obj: msg});

			this._showBox();
		};

		box._showBox = function() {
			var _this = this;
			
			if(_this._queueBusy || !_this._queueObj.length) return;
			_this._queueBusy = true;

			var obj = String(_this._queueObj.shift().obj);
			
			//Replace with Emojis? Why not!
			obj = toEmoji(obj);
			
			function notBusy() {
				_this._queueBusy = false;
				_this._showBox();
			}

			_animateBoxIn(_this, () => _animateBoxOut(_this, notBusy));

			_this._cbSetInnerHTML && _this._cbSetInnerHTML(obj);
		};
	}

	function _initTransforms(obj) {
		const nil = "+=0";

		TweenMax.set(obj, {x: nil, y: nil, alpha: nil, rotation: nil, scaleX: nil, scaleY: nil});

		var gs = (!obj.length ? obj : obj[0])._gsTransform || {};
		obj._initX = gs.x;
		obj._initY = gs.y;

		TweenMax.set(obj, {alpha: 0});
	}
	
	function _hasOtherBoxesPresent(boxThis) {
		for(var b=$$$.boxes.length; --b>=0;) {
			var box = $$$.boxes[b];
			if(box==boxThis) continue;
			if(box.is(':visible')) return true;
		}
		
		return false;
	}

	function _animateBoxIn(box, cb=null) {
		box.show();
		var gotoY = box._initY + (_hasOtherBoxesPresent(box) ? box._offset : 0);
		return TweenMax.to(box, 0.3, {y: gotoY, alpha: 1, ease: Back.easeIn, onComplete: () => {
			cb && _.delay(cb, 2000 / (box._queueObj.length+1))
		}});
	}

	function _animateBoxOut(box, cb=null) {
		return TweenMax.to(box, 0.3, {y: box._initY - 10, alpha: 0, ease: Back.easeOut, onComplete: () => {
			box.hide();
			cb && cb();
		}});
	}
}

function registerComponents(compList) {
	_.keys(compList).forEach( function(compName) {
		var tag = compList[compName];

		//Assume a default template ID naming convention if no raw HTML is used:
		if(!tag.template || !tag.template.length) {
			tag.template = '#'+compName+'-tmp';

			trace("Registering tag: " + tag.template);
		}

		Vue.component(compName, tag);
	});
}

function fadeIn(el, time=0.5, cb=null) {
	el.show && el.show();
	TweenMax.fromTo(el, time, {alpha: 0}, {alpha: 1, onComplete: cb});
}

function downloadJSON(jsonData, fileName="download.json") {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
	var $downloads = $('#download-links');
	$downloads.attr("href", dataStr);
	$downloads.attr("download", fileName);
	$downloads[0].click();
}

function onBeep() {
	if(ERDS.$restart) return;
	trace("BEEPING!");

	ERDS.beep.play();
	ERDS.$restart = $('<a class="server-restart" href="javascript:;">RESTART SERVER!</a>');
	ERDS.$restart.click(function() {
		ERDS.io.emit('kill');
	});
	
	$('.git-info').append(ERDS.$restart);
}

function onHasManyBackups(numBackups) {
	$$$.boxInfo.showBox("ATTENTION: There are currently $0 backups on the server!".rep([numBackups]));
}

TimelineMax.prototype.wait = function (time, offset) {
	return this.to({}, time, {}, offset);
};