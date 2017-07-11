$$$.isMac = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
$$$.on('load', function () {
    Cookies._prefix = "erds.web.";
    loadAudioSprite('defaultSFX.json', '../media/', function (howl) { return $$$.defaultSFX = howl; });
    var _io = $$$.io = io(); //Create a socket connection:
    _io.on('beep', onBeep);
    _io.on("echo", function (response) { return $$$.boxInfo.showBox(response); });
    _io.on("saved", onSaved);
    _io.on("server-error", function (response) { traceError(response); $$$.boxError.showBox(response); });
    _io.on('file-changed', onFileChanged);
    _io.on('project-fetch', onProjectFetch);
    _io.on('has-many-backups', onHasManyBackups);
    _io.emit('project-fetch', $$$.projectName);
});
function sendProjectCommand(command, params) {
    if (params === void 0) { params = null; }
    $$$.io.emit('project-command', {
        project: $$$.projectName,
        dateClient: new Date(),
        command: command,
        params: params
    });
}
function onFileChanged(whichFile) {
    window.location.reload(true);
}
function onProjectFetch(projectData) {
    $$$.projectData = projectData;
    if (!$$$.Project)
        return traceError("Missing $$$.Project");
    if ($$$.vue)
        return traceError("Vue already created!");
    var project = $$$.project = new $$$.Project();
    $$$.vueConfig = {
        el: '#app',
        data: {
            message: 'Test VueJS Message!',
            errors: '',
            infos: '' //,
        },
        methods: {}
    };
    if (!project.extendVue) {
        $$$.boxError.showBox("Missing 'project.extendVue()' method!");
        return;
    }
    if ($$$.extendVue) {
        $$$.vueConfig = _.merge($$$.vueConfig, $$$.extendVue());
    }
    $$$.vueConfig = _.merge($$$.vueConfig, project.extendVue());
    $(window).trigger('vue-extend');
    $('.init-hidden').removeClass('init-hidden');
    $$$.vue = new Vue($$$.vueConfig);
    initializeUI();
    project.init && project.init(projectData);
}
function stopEvent(e) {
    if (!e)
        return true;
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    return false;
}
function addNav(fragment) {
    if (typeof (fragment) == "string")
        fragment = $(fragment);
    $$$.navbarHeader.append(fragment);
}
function addMenu(fragment) {
    if (typeof (fragment) == "string")
        fragment = $(fragment);
    var menuItems = fragment.find('i[title]');
    menuItems.each(function (id, item) {
        var $item = $(item);
        var $div = $('<div class="menu-container"></div>');
        var $kids = $item.find('i');
        $div.append($kids);
        $kids.addClass('menu-item');
        if (!$kids.length)
            $item.addClass('leaf-item');
        var $span = $('<span>' + $item.attr('title') + '</span>');
        $item.prepend($div);
        $item.prepend($span);
        $span.click(function (e) {
            if ($item.hasClass('leaf-item'))
                return;
            stopEvent(e);
            $div.show();
        });
    });
    $$$.on('click', function () {
        $('.menu-container').hide();
    });
    addNav(fragment);
}
function initializeUI() {
    $$$.app = $('#app');
    $$$.navbarHeader = $('.navbar-header');
    $$$.boxError = $('.box-error');
    $$$.boxInfo = $('.box-info');
    $$$.boxes = [$$$.boxError, $$$.boxInfo];
    $$$.Clipboard = new Clipboard('.clippy');
    $$$.Clipboard.on('success', function (e) {
        trace(e);
        var $trigger = $(e.trigger);
        var $span = $trigger.find('.clippy-ok');
        if (!$span || !$span.length)
            return;
        var timeAlive = 1.0 + (e.text.length) * 0.05;
        trace(timeAlive);
        $span.show();
        TweenMax.set($span, { alpha: 1 });
        TweenMax.from($span, 0.4, { alpha: 0, y: "-=5", ease: Sine.easeOut });
        TweenMax.to($span, 0.8, { alpha: 0, delay: timeAlive, ease: Linear.easeNone });
    });
    _makeQueueBox($$$.boxInfo, function (obj) {
        $$$.vue.infos = !_.isString(obj) && _.isObject(obj) ? JSON.stringify(obj) : obj;
    }, 0);
    _makeQueueBox($$$.boxError, function (err) {
        $$$.vue.errors = _.isString(err) ? err : (err ? err.responseText : "Error...");
    }, 50);
    $$$.on('mousedown', function (e) {
        var stopMouse = false;
        $$$.boxes.forEach(function (box) {
            if (!box.is(":visible"))
                return;
            stopMouse = true;
            TweenMax.killTweensOf(box);
            TweenMax.to(box, 0.5, { alpha: 0, onComplete: function () {
                    box.hide();
                } });
        });
        if (stopMouse)
            return stopEvent(e);
        return true;
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
            obj = toIcon(toEmoji(obj));
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
        setTimeout(function () { return makeFancyEffects($(box[0])); }, 0);
        var gotoY = box._initY + (_hasOtherBoxesPresent(box) ? box._offset : 0);
        return TweenMax.to(box, 0.3, { y: gotoY, alpha: 1, ease: Back.easeIn, onComplete: function () {
                cb && _.delay(cb, 4000 / (box._queueObj.length + 1));
            } });
    }
    function _animateBoxOut(box, cb) {
        if (cb === void 0) { cb = null; }
        return TweenMax.to(box, 0.3, { y: box._initY - 10, alpha: 0, ease: Back.easeOut, onComplete: function () {
                box.hide();
                cb && cb();
            } });
    }
    function makeFancyEffects($target) {
        var $twn = $target.find('.twn');
        var classes = $twn.attr('class');
        if (!classes)
            return;
        var matches = classes.match(/twn\-([a-z\-]*)/g);
        matches.forEach(function (fxName) {
            switch (fxName) {
                case 'twn-bounce': TweenMax.to($twn, 0.2, { y: "-=5", yoyo: true, repeat: 5 });
                default: return;
            }
        });
        //window.$twn = $twn;
    }
}
function registerComponents(compList) {
    _.keys(compList).forEach(function (compName) {
        var tag = compList[compName];
        //Assume a default template ID naming convention if no raw HTML is used:
        if (!tag.template || !tag.template.length) {
            tag.template = '#' + compName + '-tmp';
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
function downloadJSON(jsonData, fileName) {
    if (fileName === void 0) { fileName = "download.json"; }
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData));
    var $downloads = $('#download-links');
    $downloads.attr("href", dataStr);
    $downloads.attr("download", fileName);
    $downloads[0].click();
}
function isMuted() {
    return $$$.projectData && $$$.projectData.yargs && $$$.projectData.yargs.muted;
}
function playSound() {
    playSFX($$$.defaultSFX, 'mario_coin', 0.5);
}
function onBeep() {
    if ($$$.$restart)
        return;
    trace("BEEPING!");
    playSound();
    $$$.$restart = $('<a class="server-restart" href="javascript:;">RESTART SERVER!</a>');
    $$$.$restart.click(function () {
        $$$.io.emit('kill');
    });
    $('.git-info').append($$$.$restart);
}
function onSaved(response) {
    $$$.boxInfo.showBox(response);
    if (isMuted())
        return;
    playSFX($$$.defaultSFX, 'mario_1up', 0.5);
}
function onHasManyBackups(numBackups) {
    $$$.boxInfo.showBox("ATTENTION: There are currently $0 backups on the server!".rep([numBackups]));
}
TimelineMax.prototype.wait = function (time, offset) {
    return this.to({}, time, {}, offset);
};
function loadAudioSprite(url, prefix, cb) {
    if (!cb) {
        $$$.boxError.showBox("Missing callbacks for AudioSprite! :cry: :mute:");
        return;
    }
    var fullURL = prefix + url;
    $.ajax({
        url: fullURL,
        success: function (json) {
            if (!json)
                return;
            json.src = json.src.map(function (file) { return prefix + file; });
            cb(new Howl(json));
        },
        error: function (err) {
            $$$.boxError.showBox("Failed to load AudioSprite URL " + fullURL + "! :cry: :mute:");
        }
    });
}
function playSFX(howler, name, volume) {
    if (volume === void 0) { volume = 1.0; }
    if (isMuted()) {
        traceError("muted sounds.");
        return;
    }
    var sfxID = howler.play(name);
    howler.volume(volume, sfxID);
}
function postJSON(options) {
    options = _.extend(options, {
        type: 'POST',
        contentType: 'application/json'
    });
    if (options.json) {
        options.data = JSON.stringify(options.json);
    }
    return $.ajax(options);
}
function postAuthJSON(options) {
    options = _.extend(options, {
        beforeSend: function (ajax) {
            ajax.setRequestHeader('Authorization', $$$.authorization);
        }
    });
    postJSON(options);
}
function fieldsParser(string) {
    var fields = { _raw: null };
    var cbFieldSplitter = function (t) { return t.split('=')
        .map(function (f) { return f.trim(); })
        .map(function (f) { return f.split('|')
        .map(function (e) { return e.trim(); }); }); };
    var strSplit = string.trim()
        .split('\n')
        .map(function (t) { return t.trim(); })
        .map(cbFieldSplitter);
    strSplit.forEach(function (item, index) {
        fields[item[0]] = item[1];
    });
    fields._raw = strSplit;
    return fields;
}
$$$.fx = {
    show: function ($el) {
        $el.show();
        TweenMax.fromTo($el, 0.3, { alpha: 0 }, { alpha: 1 });
    },
    hide: function ($el) {
        TweenMax.fromTo($el, 0.3, { alpha: 1 }, { alpha: 0, onComplete: function () { return $el.hide(); } });
    }
};
var Spinner = (function () {
    function Spinner() {
        this._el = null;
        this._twn = null;
        this.isBusy = false;
        this.onStopBusy = null;
        this._el = $('#spinner');
        this._el.hide();
        TweenMax.set(this._el, { alpha: 0 });
    }
    Spinner.prototype._killTween = function () {
        if (!this._twn)
            return;
        this._twn.kill();
        this._twn = null;
    };
    Spinner.prototype.startBusy = function (spinTime, predelay, cb) {
        if (spinTime === void 0) { spinTime = 0.5; }
        if (predelay === void 0) { predelay = 0; }
        if (cb === void 0) { cb = null; }
        this.isBusy = true;
        this._killTween();
        this._el.show();
        TweenMax.to(this._el, 0.3, { alpha: 1 });
        this._twn = TweenMax.to(this._el, spinTime, { rotation: "+=360", repeat: -1, ease: Linear.easeNone });
        var _stopBusy = this.stopBusy.bind(this);
        if (cb)
            setTimeout(function () { return cb(_stopBusy); }, predelay * 1000);
    };
    Spinner.prototype.stopBusy = function () {
        this._killTween();
        TweenMax.to(this._el, 0.3, { alpha: 0 });
        this.onStopBusy && this.onStopBusy();
        this.isBusy = false;
    };
    return Spinner;
}());
