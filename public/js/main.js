var $$$ = {};
ERDS.appVue = new Vue({
    el: '#app',
    data: {
        message: 'Test VueJS Message!',
        errors: '',
        infos: ''
    }
});
window.addEventListener('load', function () {
    $$$.boxError = $('.box-error');
    $$$.boxInfo = $('.box-info');
    makeQueueBox($$$.boxInfo, function (obj) {
        ERDS.appVue.infos = !_.isString(obj) && _.isObject(obj) ? JSON.stringify(obj) : obj;
    });
    makeQueueBox($$$.boxError, function (err) {
        ERDS.appVue.errors = _.isString(err) ? err : (err ? err.responseText : "Error...");
    });
    //Create a socket connection:
    ERDS.io = io();
    if (ERDS.Project) {
        ERDS.project = new ERDS.Project();
        ERDS.project.init();
    }
    ERDS.io.on("echo", function (data) { return $$$.boxInfo.showBox(data); });
    ERDS.io.emit('fetch-project', ERDS.projectName);
    window.addEventListener('click', function () {
        [$$$.boxError, $$$.boxInfo].forEach(function (box) { return box.hide(); });
    });
});
function makeQueueBox(box, cb) {
    box._queueObj = [];
    box._queueBusy = false;
    _initTransforms(box);
    _animateBoxOut(box).progress(1.0);
    box.showBox = function (obj) {
        this._queueObj.push({ obj: obj });
        this._showBox();
    };
    box._showBox = function () {
        var _this = this;
        if (_this._queueBusy || !_this._queueObj.length)
            return;
        _this._queueBusy = true;
        var obj = _this._queueObj.shift().obj;
        function notBusy() {
            _this._queueBusy = false;
            _this._showBox();
        }
        _animateBoxIn(_this, function () { return _animateBoxOut(_this, notBusy); });
        cb(obj);
    };
    function _initTransforms(obj) {
        var nil = "+=0";
        TweenMax.set(obj, { x: nil, y: nil, alpha: nil, rotation: nil, scaleX: nil, scaleY: nil });
        var gs = (!obj.length ? obj : obj[0])._gsTransform;
        obj._initX = gs.x;
        obj._initY = gs.y;
    }
    function _animateBoxIn(box, cb) {
        if (cb === void 0) { cb = null; }
        box.show();
        return TweenMax.to(box, 0.3, { y: box._initY, alpha: 1, ease: Back.easeIn, onComplete: function () { return cb && _.delay(cb, 1000 / (box._queueObj.length + 1)); } });
    }
    function _animateBoxOut(box, cb) {
        if (cb === void 0) { cb = null; }
        return TweenMax.to(box, 0.3, { y: box._initY - 10, alpha: 0, ease: Back.easeOut, onComplete: function () {
                box.hide();
                cb && cb();
            } });
    }
}
