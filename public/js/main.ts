declare var ERDS, Vue, trace, traceError, io, $, _, TweenMax, Back, Cookies;

var $$$:any = {};

window.addEventListener('load', function() {
	//Vue.config.debug = true;
	Cookies._prefix = "erds.web.";
	
	ERDS.io = io(); //Create a socket connection:
	ERDS.io.on("echo", response => $$$.boxInfo.showBox(response));
	ERDS.io.on("server-error", response => $$$.boxError.showBox(response));
	ERDS.io.on('fetch-project', onFetchProject);
	ERDS.io.on('file-changed', onFileChanged);
	ERDS.io.emit('project-fetch', ERDS.projectName);
});

function projectCommand(command, params) {
	ERDS.io.emit('project-command', {
		project: ERDS.projectName,
		command: command,
		params: params
	});
}

function onFileChanged(whichFile) {
	window.location.reload(true);
}

function onFetchProject(proj) {
	if(!ERDS.Project) return traceError("Missing ERDS.Project");
	if(ERDS.vue) return traceError("Vue already created!");

	var project = ERDS.project = new ERDS.Project();
	ERDS.vueConfig = {
		el: '#app',
		data: {
			message: 'Test VueJS Message!',
			errors: '',
			infos: '',
			proj: proj
		},
		methods: {}
	};

	if(project.extendVue) {
		ERDS.vueConfig = project.extendVue(ERDS.vueConfig);
	}
	
	ERDS.vue = new Vue(ERDS.vueConfig);

	initializeUI();

	project.init && project.init();
}

function initializeUI() {
	$$$.boxError = $('.box-error');
	$$$.boxInfo = $('.box-info');
	$$$.boxes = [$$$.boxError,$$$.boxInfo];

	_makeQueueBox($$$.boxInfo, (obj) => {
		ERDS.vue.infos = !_.isString(obj) && _.isObject(obj) ? JSON.stringify(obj) : obj;
	});

	_makeQueueBox($$$.boxError, (err) => {
		ERDS.vue.errors = _.isString(err) ? err : (err ? err.responseText : "Error...");
	});

	window.addEventListener('mousedown', function() {
		$$$.boxes.forEach(box => {
			if(!box.is(":visible")) return;
			
			TweenMax.killTweensOf(box);
			TweenMax.to(box, 0.5, {alpha: 0, onComplete: () => {
				box.hide();
			}});
		});
	});

	function _makeQueueBox(box, cbSetInnerHTML) {
		box._queueObj = [];
		box._queueBusy = false;
		box._cbSetInnerHTML = cbSetInnerHTML;
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

			var obj = _this._queueObj.shift().obj;
			
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

	function _animateBoxIn(box, cb=null) {
		box.show();
		return TweenMax.to(box, 0.3, {y: box._initY, alpha: 1, ease: Back.easeIn, onComplete: () => {
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
			var $tmp = $(tag.template);
			if(!$tmp || !$tmp.length) {
				return traceError("VUEJS ERROR: Cannot find template: " + tag.template);
			}

			trace("Registering tag: " + tag.template);
		}

		Vue.component(compName, tag);
	});
}

function fadeIn(el, time=0.5, cb=null) {
	el.show && el.show();
	TweenMax.fromTo(el, time, {alpha: 0}, {alpha: 1, onComplete: cb});
}