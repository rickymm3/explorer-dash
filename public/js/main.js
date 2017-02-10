var $$$ = {};
window.addEventListener('load', function () {
    //Vue.config.debug = true;
    Cookies._prefix = "erds.web.";
    ERDS.io = io(); //Create a socket connection:
    ERDS.io.on("echo", function (response) { return $$$.boxInfo.showBox(response); });
    ERDS.io.on("server-error", function (response) { return $$$.boxError.showBox(response); });
    ERDS.io.on('file-changed', onFileChanged);
    ERDS.io.on('project-fetch', onProjectFetch);
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
    if (!ERDS.Project)
        return traceError("Missing ERDS.Project");
    if (ERDS.vue)
        return traceError("Vue already created!");
    var project = ERDS.project = new ERDS.Project();
    ERDS.vueConfig = {
        el: '#app',
        data: {
            message: 'Test VueJS Message!',
            errors: '',
            infos: '' //,
        },
        methods: {}
    };
    if (project.extendVue) {
        ERDS.vueConfig = project.extendVue(ERDS.vueConfig);
    }
    ERDS.vue = new Vue(ERDS.vueConfig);
    initializeUI();
    project.init && project.init(projectData);
}
function initializeUI() {
    $$$.boxError = $('.box-error');
    $$$.boxInfo = $('.box-info');
    $$$.boxes = [$$$.boxError, $$$.boxInfo];
    _makeQueueBox($$$.boxInfo, function (obj) {
        ERDS.vue.infos = !_.isString(obj) && _.isObject(obj) ? JSON.stringify(obj) : obj;
    }, 0);
    _makeQueueBox($$$.boxError, function (err) {
        ERDS.vue.errors = _.isString(err) ? err : (err ? err.responseText : "Error...");
    }, 50);
    window.addEventListener('mousedown', function () {
        $$$.boxes.forEach(function (box) {
            if (!box.is(":visible"))
                return;
            TweenMax.killTweensOf(box);
            TweenMax.to(box, 0.5, { alpha: 0, onComplete: function () {
                    box.hide();
                } });
        });
    });
    function _makeQueueBox(box, cbSetInnerHTML, offset) {
        if (offset === void 0) { offset = 0; }
        box._queueObj = [];
        box._queueBusy = false;
        box._cbSetInnerHTML = cbSetInnerHTML;
        box._offset = offset;
        box.show();
        _initTransforms(box);
        box.showBox = function (msg) {
            this._queueObj.push({ obj: msg });
            this._showBox();
        };
        box._showBox = function () {
            var _this = this;
            if (_this._queueBusy || !_this._queueObj.length)
                return;
            _this._queueBusy = true;
            var obj = String(_this._queueObj.shift().obj);
            //Replace with Emojis? Why not!
            obj = toEmoji(obj);
            function notBusy() {
                _this._queueBusy = false;
                _this._showBox();
            }
            _animateBoxIn(_this, function () { return _animateBoxOut(_this, notBusy); });
            _this._cbSetInnerHTML && _this._cbSetInnerHTML(obj);
        };
    }
    function _initTransforms(obj) {
        var nil = "+=0";
        TweenMax.set(obj, { x: nil, y: nil, alpha: nil, rotation: nil, scaleX: nil, scaleY: nil });
        var gs = (!obj.length ? obj : obj[0])._gsTransform || {};
        obj._initX = gs.x;
        obj._initY = gs.y;
        TweenMax.set(obj, { alpha: 0 });
    }
    function _hasOtherBoxesPresent(boxThis) {
        for (var b = $$$.boxes.length; --b >= 0;) {
            var box = $$$.boxes[b];
            if (box == boxThis)
                continue;
            if (box.is(':visible'))
                return true;
        }
        return false;
    }
    function _animateBoxIn(box, cb) {
        if (cb === void 0) { cb = null; }
        box.show();
        var gotoY = box._initY + (_hasOtherBoxesPresent(box) ? box._offset : 0);
        return TweenMax.to(box, 0.3, { y: gotoY, alpha: 1, ease: Back.easeIn, onComplete: function () {
                cb && _.delay(cb, 2000 / (box._queueObj.length + 1));
            } });
    }
    function _animateBoxOut(box, cb) {
        if (cb === void 0) { cb = null; }
        return TweenMax.to(box, 0.3, { y: box._initY - 10, alpha: 0, ease: Back.easeOut, onComplete: function () {
                box.hide();
                cb && cb();
            } });
    }
}
function registerComponents(compList) {
    _.keys(compList).forEach(function (compName) {
        var tag = compList[compName];
        //Assume a default template ID naming convention if no raw HTML is used:
        if (!tag.template || !tag.template.length) {
            tag.template = '#' + compName + '-tmp';
            var $tmp = $(tag.template);
            if (!$tmp || !$tmp.length) {
                return traceError("VUEJS ERROR: Cannot find template: " + tag.template);
            }
            trace("Registering tag: " + tag.template);
        }
        Vue.component(compName, tag);
    });
}
function fadeIn(el, time, cb) {
    if (time === void 0) { time = 0.5; }
    if (cb === void 0) { cb = null; }
    el.show && el.show();
    TweenMax.fromTo(el, time, { alpha: 0 }, { alpha: 1, onComplete: cb });
}
