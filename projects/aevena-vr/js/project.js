/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />
var __VUE, __SHEETS, __SHEET, __DEFS, __LIGHTS, __ACTIONS, __ARACOMMANDS;
var __JSONDATA, __KEYS = { SHIFT: 1, CTRL: 2, ALT: 4 };
function traceJSON(obj) {
    if (obj === void 0) { obj = null; }
    var result = JSON.stringify(obj || __JSONDATA, null, ' ');
    trace(result);
    $$$.boxInfo.showBox(result);
    return result;
}
function showPopup(header, message, options) {
    if (!options)
        options = {};
    options = _.assign(options, { header: header, message: message });
    if (!options.dismiss) {
        options.dismiss = { ok: true, cancel: true };
        if (options.ok)
            options.dismiss.ok = options.ok;
        if (options.cancel)
            options.dismiss.cancel = options.cancel;
    }
    __VUE.popup = options;
}
(function ($$$) {
    registerComponents({
        comp: {
            props: ['obj'],
            template: '<div class="v-comp" v-bind:is="obj.type" v-bind:obj="obj"><slot></slot></div>'
        },
        'view-tab': {
            props: [],
            template: '<div><slot></slot></div>'
        },
        'numeric-prop': {
            props: ['obj'],
            template: "<div class=\"numeric-prop\">\n\t\t\t\t\t<div class=\"col-1\">\n\t\t\t\t\t\t<i v-html=\"obj.name.camelToTitleCase()\"></i>:\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"col-2\">\n\t\t\t\t\t\t<input type=\"text\" v-model:value=\"obj.value\" />\n\t\t\t\t\t</div>\n\t\t\t\t</div>"
        },
        'light-item': {
            props: ['obj'],
            methods: {
                showPanel: function () {
                    __VUE.currentLightItem = this.obj;
                    setCookie('light', __LIGHTS.indexOf(this.obj));
                }
            },
            computed: {
                isSelected: function () {
                    return {
                        isSelected: __VUE.currentLightItem == this.obj
                    };
                }
            },
            template: "<div class=\"item light-item\" :class=\"isSelected\">\n\t\t\t\t\t<btn :label=\"obj.name\" v-on:click=\"showPanel()\" />\n\t\t\t\t\t<slot></slot>\n\t\t\t\t</div>"
        },
        'action-item': {
            props: ['obj'],
            methods: {
                showPanel: function () {
                    __VUE.currentActionItem = this.obj;
                    setCookie('action', __ACTIONS.indexOf(this.obj));
                }
            },
            computed: {
                isSelected: function () {
                    return {
                        isSelected: __VUE.currentActionItem == this.obj
                    };
                }
            },
            template: "<div class=\"item action-item\" :class=\"isSelected\">\n\t\t\t\t\t<btn :label=\"obj.name\" v-on:click=\"showPanel()\"></btn><slot></slot>\n\t\t\t\t</div>"
        },
        'btn': {
            props: ['obj', 'label', 'emoji', 'icon'],
            methods: { click: function (e) { this.$emit('click', e); } },
            template: "<div class=\"btn\" v-on:click.capture.stop.prevent=\"click\">\n\t\t\t\t\t<i v-if=\"emoji\" :class=\"'v-align-mid em em-'+emoji\" aria-hidden=\"true\"></i>\n\t\t\t\t\t<i v-if=\"icon\" :class=\"'v-align-mid icon fa fa-'+icon\" aria-hidden=\"true\"></i>\n\t\t\t\t\t<i v-html=\"label\"></i>\n\t\t\t\t</div>"
        },
        'dropdown': {
            props: {
                list: Array,
                nolabel: { type: Boolean },
                target: { type: Object },
                property: { type: String },
                label: { type: String, "default": '' },
                icon: { "default": "caret-down" },
                //is_selected: { type: Function, default() { return false; } },
                dropdown_source: [Object, Array, String],
                class_dropdown: { type: String, "default": "default-dropdown" },
                class_btn: { type: String, "default": "default-btn" }
            },
            computed: {
                currentValue: function () {
                    return this.target == null || this.property == null ? null : this.target[this.property];
                },
                currentDropDown: function () {
                    return __VUE ? __VUE.currentDropDown : null;
                }
            },
            methods: {
                isSelected: function (item) {
                    return this.currentValue == item.name;
                },
                onButtonClick: function (e) {
                    __VUE.setCurrentDropDown(this.dropdown_source);
                    this.$emit('dropdown', e);
                },
                onSelectionClick: function (e) {
                    var $e = $(e.target);
                    var $value = $e.data('value');
                    var $index = $e.data('index');
                    this.$emit('click', e);
                    this.target[this.property] = $value;
                    // //Select ID:
                    // var id = parseInt($index);
                    // id = isNaN(id) ? -1 : id;
                    // if(id==-1) return;
                    // this.$emit('selected', this.list[id] );
                },
                onMouseDown: function (e) {
                    stopEvent(e);
                }
            },
            template: "<span class=\"dropdown\">\n\t\t\t\t\t<btn @click=\"onButtonClick($event)\"\n\t\t\t\t\t\t class=\"padded-5\"\n\t\t\t\t\t\t :class=\"class_btn\"\n\t\t\t\t\t\t :icon=\"icon\"\n\t\t\t\t\t\t :label=\"nolabel ? '' : currentValue\">\n\t\t\t\t\t</btn>\n\t\t\t\t\t<div :class=\"class_dropdown\"\n\t\t\t\t\t\tclass=\"dropdown-list\"\n\t\t\t\t\t\t v-if=\"currentDropDown==dropdown_source\"\n\t\t\t\t\t\t @mousedown=\"onMouseDown($event)\"\n\t\t\t\t\t\t @click=\"onSelectionClick($event)\">\n\t\t\t\t\t\t<div v-for=\"(item, id) in list\"\n\t\t\t\t\t\t\tv-html=\"item.name\"\n\t\t\t\t\t\t\t:class=\"{isSelected: isSelected(item)}\"\n\t\t\t\t\t\t\t:data-value=\"item.name\"\n\t\t\t\t\t\t\t:data-index=\"id\"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</span>"
        },
        'light-comp': {
            props: [
                'obj',
                'header',
                'prefix',
                'class_lightcomp',
                'steps',
                'loops',
                'holds'
            ],
            data: function () {
                return {
                    'currentColor': '#fff',
                    'currentStepID': 0,
                    'currentFocus': 'Colors',
                    'isMouseDown': false
                };
            },
            computed: {
                currentStepName: function () {
                    return 'current' + this.prefix + 'Step';
                },
                currentStep: function () {
                    if (this.steps.length == 0)
                        return null;
                    if (this.currentStepID < 0 || this.currentStepID >= this.steps.length) {
                        this.currentStepID = 0;
                    }
                    return this.steps[this.currentStepID];
                },
                currentLights: function () {
                    var step = this.currentStep;
                    var _this = this;
                    __VUE.$nextTick(function () { return _this.updateLayout(); });
                    return step.lights;
                },
                isFocusColors: function () {
                    return this.currentFocus == "Colors";
                },
                currentDropDown: function () {
                    return __VUE.currentDropDown;
                },
                colors: function () {
                    return __VUE.hardcoded ? __VUE.hardcoded.Colors : null;
                },
                modes: function () {
                    return __VUE.hardcoded ? __VUE.hardcoded.LightStates : null;
                },
                audioClips: function () {
                    return __VUE.hardcoded ? __VUE.hardcoded.AudioClips : null;
                }
            },
            methods: {
                updateLayout: function () {
                    var $bulbs = $(this.$el).find('.bulb');
                    var $bulb = $($bulbs[0]);
                    var len = $bulbs.length;
                    var isRing = this.class_lightcomp.has('ring');
                    if (isRing) {
                        var offset = 90 * (Math.PI / 180);
                        var angleSteps = (360 / len) * (Math.PI / 180);
                        var amplitude = 50 + ((len - 8) * 5);
                        $bulbs.each(function (id, bulb) {
                            var angle = -offset + (id * angleSteps);
                            var posX = Math.cos(angle) * amplitude;
                            var posY = Math.sin(angle) * amplitude;
                            TweenMax.set(bulb, { x: posX, y: posY });
                        });
                    }
                    else {
                        var stepWidth = $bulb.width() + 5;
                        var fullWidth = len * stepWidth;
                        var halfWidth = fullWidth * 0.5;
                        trace(stepWidth);
                        $bulbs.each(function (id, bulb) {
                            var posX = -halfWidth + id * stepWidth;
                            TweenMax.set(bulb, { x: posX });
                        });
                    }
                },
                addStep: function () {
                    this.steps.push(globalAddLightStep());
                    this.currentStepID = this.steps.length - 1;
                },
                copyStep: function (item) {
                    var newItem = duplicateItem(item, this.steps);
                    this.currentStepID = this.steps.indexOf(newItem);
                    //this.currentLightItem.name += " (Copy)";
                },
                removeStep: function (item) {
                    removeItem(item, this.steps, this.currentStepName);
                },
                setCurrentDropDown: function (item) {
                    __VUE.currentDropDown = item;
                },
                convertStateToChar: function (light) {
                    switch (light.state) {
                        case "Colors": return "!";
                        case "Off": return toIcon("~battery-0~");
                        case "Full": return toIcon("~battery-full~");
                        case "Half": return toIcon("~battery-2~");
                        case "Quarter": return toIcon("~battery-1~");
                        case "FadeOn": return "&#x25E2;";
                        case "FadeOff": return "&#x25E3;";
                    }
                },
                setCurrentFocus: function (e) {
                    if (!this.currentStep)
                        return;
                    this.currentFocus = e.name;
                },
                setCurrentAudio: function (e) {
                    if (!this.currentStep)
                        return;
                    this.currentStep.audioClipName = e.name;
                    this.playSFX();
                },
                playSFX: function (step) {
                    if (!step)
                        step = this.currentStep;
                    playSFX($$$.audiosprite, step.audioClipName, step.audioVolume * 0.6);
                },
                isAudioSelected: function (item) {
                    return this.currentStep.audioClipName == item.name;
                },
                isCurrentMode: function (item) {
                    return this.currentFocus == item.name;
                },
                showDecimals: function (num) {
                    return parseFloat(num).toFixed(1);
                },
                setNav: function () {
                    var _this = this;
                    if (__VUE.nav != _this) {
                        __VUE.selectedSteps = null;
                        //__VUE.copiedSteps = null;
                        if (__VUE.nav)
                            __VUE.nav.$forceUpdate();
                        __VUE.nav = _this;
                    }
                    trace("NAV is: " + this.header);
                    _this.isMouseDown = true;
                    $(window).one('mouseup', function () {
                        trace("Mouse is up now");
                        _this.isMouseDown = false;
                    });
                },
                onClickBulb: function (light) {
                    if (this.isFocusColors) {
                        light.color = this.currentColor;
                        this.$forceUpdate();
                        return;
                    }
                    light.state = this.currentFocus;
                    this.$forceUpdate();
                },
                onHoverBulb: function (light) {
                    var id = this.currentStep.lights.indexOf(light);
                    trace("Hovering on " + id);
                    if (!this.isMouseDown)
                        return;
                    this.onClickBulb(light);
                },
                applyAll: function () {
                    var t = this;
                    if (!t.currentStep || !t.currentStep.lights)
                        return;
                    t.currentStep.lights.forEach(function (light) { return t.onClickBulb(light); });
                },
                setStepID: function (e, id) {
                    if (__VUE.statusKeyModifiers > 0) {
                        if (!__VUE.selectedSteps || !__VUE.selectedSteps.length) {
                            __VUE.selectedSteps = [];
                        }
                        __VUE.copiedSteps = null;
                        __VUE.selectedSteps.push(this.steps[id]);
                        this.$forceUpdate();
                        return;
                    }
                    __VUE.selectedSteps = null;
                    this.currentStepID = id;
                    this.playSFX();
                    //__VUE[this.currentStepName] = this.steps[id];
                },
                isMultiSelected: function (step) {
                    return !__VUE.selectedSteps ? false : __VUE.selectedSteps.has(step);
                },
                isCopied: function (step) {
                    return !__VUE.copiedSteps ? false : __VUE.copiedSteps.has(step);
                },
                onCopy: function (e) {
                    if (!__VUE.selectedSteps || !__VUE.selectedSteps.length) {
                        if (!this.currentStep)
                            return;
                        __VUE.selectedSteps = [this.currentStep];
                    }
                    __VUE.copiedSteps = __VUE.selectedSteps;
                    this.$forceUpdate();
                },
                onPaste: function (e) {
                    if (!__VUE.copiedSteps || !__VUE.copiedSteps.length || !this.currentStep)
                        return;
                    var id = this.steps.indexOf(this.currentStep);
                    var items = _.jsonClone(__VUE.copiedSteps);
                    var before = this.steps.length;
                    this.steps.insert(id + 1, items);
                    trace("Steps: before: " + before + " : " + this.steps.length);
                    this.$forceUpdate();
                    //__VUE.$forceUpdate();
                },
                goUp: function (e) {
                    stopEvent(e);
                    if (this.currentStepID <= 0)
                        return;
                    this.currentStepID--;
                },
                goDown: function (e) {
                    stopEvent(e);
                    if (this.currentStepID >= (this.steps.length - 1))
                        return;
                    this.currentStepID++;
                },
                goLeft: function (e) {
                    stopEvent(e);
                    this.rotateLeft();
                },
                goRight: function (e) {
                    stopEvent(e);
                    this.rotateRight();
                },
                rotateLeft: function () {
                    var step = this.currentStep;
                    step.lights = step.lights.concat().rotate(1);
                },
                rotateRight: function () {
                    var step = this.currentStep;
                    step.lights = step.lights.concat().rotate(-1);
                },
                playSequence: function (e) {
                    stopEvent(e);
                    if (this._tween) {
                        this._tween.kill();
                        this._tween = null;
                    }
                    var _this = this;
                    var twn = this._tween = new TimelineMax();
                    var len = this.steps.length;
                    var bulbs = this.$refs.lights;
                    this.$el.classList.add('hide-icons');
                    twn.addLabel('start');
                    bulbs.forEach(function (bulb) {
                        twn.to(bulb, 0.2, { scale: 0.5, alpha: 0 }, 'start');
                        twn.set(bulb, { scale: 1.0 });
                    });
                    twn.wait(0.2);
                    for (var s = 0; s < len; s++) {
                        var step = this.steps[s];
                        var label = 'step' + s;
                        var lights = step.lights;
                        twn.addLabel(label);
                        twn.set(_this, { currentStepID: s });
                        for (var i = 0; i < lights.length; i++) {
                            var light = lights[i];
                            var bulb = bulbs[i];
                            var twnTo = {};
                            var state = light.state.toLowerCase();
                            var doNow = false;
                            switch (state) {
                                case 'fadeon':
                                    twnTo.alpha = 1.0;
                                    break;
                                case 'fadeoff':
                                    twnTo.alpha = 0.0;
                                    break;
                                case 'fadehalf':
                                    twnTo.alpha = 0.5;
                                    break;
                                case 'quarter':
                                    twnTo.alpha = 0.25;
                                    doNow = true;
                                    break;
                                case 'half':
                                    twnTo.alpha = 0.5;
                                    doNow = true;
                                    break;
                                case 'full':
                                    twnTo.alpha = 1.0;
                                    doNow = true;
                                    break;
                                case 'off':
                                    twnTo.alpha = 0.0;
                                    doNow = true;
                                    break;
                            }
                            if (doNow)
                                twn.set(bulb, twnTo, label);
                            else
                                twn.to(bulb, parseFloat(step.time), twnTo, label);
                        }
                        twn.wait(step.time, label);
                    }
                    twn.wait(0.5);
                    twn.call(function () {
                        _this.currentStepID = 0;
                        _this.$el.classList.remove('hide-icons');
                    });
                    twn.addLabel('end');
                    bulbs.forEach(function (bulb) {
                        twn.set(bulb, { scale: 0.5 }, 'end');
                        twn.to(bulb, 0.2, { scale: 1.0, alpha: 1 }, 'end');
                    });
                    twn.play();
                }
            },
            template: "\n\t\t\t<div class=\"padded-3 subpanel\" @mousedown.capture=\"setNav()\">\n\t\t\t\t<i class=\"subheader nowrap v-align-mid-kids\">\n\t\t\t\t\t<i v-html=\"header\"></i>\n\t\t\t\n\t\t\t\t\t<i class=\"spacer-1\">\n\t\t\t\t\t\t<input type=\"checkbox\" value=\"loops\" v-model=\"obj[loops]\"> &nbsp;\n\t\t\t\t\t\t<i class=\"fa fa-refresh v-align-mid\" title=\"Looping\"></i>\n\t\t\t\t\t</i>\n\t\t\t\n\t\t\t\t\t<i class=\"spacer-1\">\n\t\t\t\t\t\t<input type=\"checkbox\" value=\"holds\" v-model=\"obj[holds]\"> &nbsp;\n\t\t\t\t\t\t<i class=\"fa fa-pause v-align-mid\" title=\"Hold Last\"></i>\n\t\t\t\t\t</i>\n\t\t\t\n\t\t\t\t\t<i class=\"break\">\n\t\t\t\t\t\t<btn class=\"\" icon=\"plus-square\" label=\"Step\" @click=\"addStep\"></btn>\n\t\t\t\t\t\t<btn class=\"\" icon=\"play\" @click=\"playSequence($event)\"></btn>\n\t\t\t\t\t</i>\n\t\t\t\t</i>\n\t\t\t\n\t\t\t\t<br/>\n\t\t\t\n\t\t\t\t<div class=\"light-comp missing bg-disabled\" v-if=\"!currentStep\" :class=\"class_lightcomp\">\n\t\t\t\t\tNo Sequence Data Found!\n\t\t\t\t</div>\n\t\t\t\n\t\t\t\t<div class=\"light-comp\" v-if=\"currentStep\" :class=\"class_lightcomp\">\n\t\t\t\t\t<i class=\"nowrap\">\n\t\t\t\t\t\t<btn class=\"padded-5\" label=\"Apply All\" @click=\"applyAll\"></btn>\n\t\t\t\t\t\t\n\t\t\t\t\t\t<dropdown\tclass_btn=\"color-names\"\n\t\t\t\t\t\t\t\t\t class_dropdown=\"step-modes\"\n\t\t\t\t\t\t\t\t\t icon=\"paint-brush\"\n\t\t\t\t\t\t\t\t\t property=\"currentFocus\"\n\t\t\t\t\t\t\t\t\t :target=\"this\"\n\t\t\t\t\t\t\t\t\t :list=\"modes\"\n\t\t\t\t\t\t\t\t\t :dropdown_source=\"currentStep\">\n\t\t\t\t\t\t</dropdown>\n\t\t\t\n\t\t\t\t\t\t<i class=\"padded-5 v-align-mid\">\n\t\t\t\t\t\t\t<i v-if=\"isFocusColors\" class=\"v-align-mid\">\n\t\t\t\t\t\t\t\t<input class=\"color-picker\" v-model=\"currentColor\" \n\t\t\t\t\t\t\t\t\t:style=\"{backgroundColor: currentColor}\">\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<div class=\"color-cells\">\n\t\t\t\t\t\t\t\t\t<i v-for=\"(clr, id) in colors\" ref=\"colorpallette\">\n\t\t\t\t\t\t\t\t\t\t<span @click=\"currentColor = clr.name\" class=\"cell\" :style=\"{backgroundColor: clr.name}\">\n\t\t\t\t\t\t\t\t\t    </span>\n\t\t\t\t\t\t\t\t\t\t<br v-if=\"(id == 5)\" />\n\t\t\t\t\t\t\t\t\t</i>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t   \n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</i>\n\t\t\t\t\t\t</i>\n\t\t\t\t\t</i>\n\t\t\t\n\t\t\t\t\t<br/>\n\t\t\t\t\t\n\t\t\t\t\t<dropdown\tclass_btn=\"audio\"\n\t\t\t\t\t\t\t\t class_dropdown=\"audio-list\"\n\t\t\t\t\t\t\t\t icon=\"volume-up\"\n\t\t\t\t\t\t\t\t :nolabel=\"true\"\n\t\t\t\t\t\t\t\t property=\"audioClipName\"\n\t\t\t\t\t\t\t\t :target=\"currentStep\"\n\t\t\t\t\t\t\t\t :list=\"audioClips\"\n\t\t\t\t\t\t\t\t :dropdown_source=\"steps\">\n\t\t\t\t\t</dropdown>\n\t\t\t\n\t\t\t\t\t<i v-if=\"currentStep.audioClipName!='Off'\">\n\t\t\t\t\t\t<input class=\"padded-2 audio-name\" v-model:value=\"currentStep.audioClipName\"\n\t\t\t\t\t\t\t   @click=\"playSFX()\" @change=\"playSFX()\"/>\n\t\t\t\n\t\t\t\t\t\t<i class=\"nowrap\">\n\t\t\t\t\t\t\t<i>Volume</i>\n\t\t\t\t\t\t\t<input class=\"digits-2\" v-model:value=\"currentStep.audioVolume\"\n\t\t\t\t\t\t\t\t   @click=\"playSFX()\" @change=\"playSFX()\">\n\t\t\t\t\t\t</i>\n\t\t\t\t\t</i>\n\t\t\t\n\t\t\t\n\t\t\t\n\t\t\t\t\t<!-- Draw Actual Component -->\n\t\t\t\t\t<div class=\"center\">\n\t\t\t\t\t\t<i v-for=\"(light, id) in currentLights\" ref=\"lights\"\n\t\t\t\t\t\t   :class=\"['bulb', 'bulb-'+id, 'bulb-'+light.state.toLowerCase()]\"\n\t\t\t\t\t\t   :style=\"{backgroundColor: light.color}\"\n\t\t\t\t\t\t   @mouseover=\"onHoverBulb(light)\"\n\t\t\t\t\t\t   @mousedown=\"onClickBulb(light)\">\n\t\t\t\t\t\t</i>\n\t\t\t\t\t</div>\n\t\t\t\n\t\t\t\t\t<i class=\"bottom-bar\">\n\t\t\t\t\t\t<btn icon=\"rotate-left\" @click=\"rotateLeft()\" title=\"rotates LEDs left\"></btn>\n\t\t\t\t\t\t<btn icon=\"rotate-right\" @click=\"rotateRight()\" title=\"rotates LEDs right\"></btn>\n\t\t\t\n\t\t\t\t\t</i>\n\t\t\t\t</div>\n\t\t\t\n\t\t\t\t<div v-if=\"!currentStep\" class=\"steps padded-3 v-align-mid shadowy\">\n\t\t\t\t\t<i class=\"padded-5 inline-block\"><b>Add a Light Sequence Step:</b></i>\n\t\t\t\t\t<btn class=\"v-align-mid\" icon=\"plus-square\" label=\"Step\" @click=\"addStep\"></btn>\n\t\t\t\t</div>\n\t\t\t\n\t\t\t\t<draggable v-if=\"currentStep\" class=\"steps\" :list=\"steps\" :options=\"{ handle: '.drag-handle' }\">\n\t\t\t\t\t<div class=\"step\"\n\t\t\t\t\t\t :class=\"{isSelected: currentStepID==id, isMulti: isMultiSelected(step), isCopied: isCopied(step)}\"\n\t\t\t\t\t\t @click=\"setStepID($event, id)\"\n\t\t\t\t\t\t v-for=\"(step, id) in steps\">\n\t\t\t\t\t\t<btn icon=\"trash-o\" @click=\"removeStep(step)\"></btn>\n\t\t\t\t\t\t<btn icon=\"clone\" @click=\"copyStep(step)\"></btn>\n\t\t\t\t\t\t<btn icon=\"sort\" class=\"drag-handle\" title=\"Sort param\"></btn>\n\t\t\t\n\t\t\t\t\t\t<i class=\"bulb-short bulb-statuses\" v-for=\"(light, id) in step.lights\">\n\t\t\t\t\t\t\t<i class=\"bulb-stat\"\n\t\t\t\t\t\t\t   :style=\"{color: light.color}\"\n\t\t\t\t\t\t\t   v-html=\"convertStateToChar(light)\">\n\t\t\t\t\t\t\t</i>\n\t\t\t\t\t\t</i>\n\t\t\t\n\t\t\t\t\t\t<i class=\"nowrap\">\n\t\t\t\t\t\t\t<i class=\"fa fa-clock-o\"></i>\n\t\t\t\t\t\t\t<input class=\"digits-4\" v-model:value=\"step.time\">\n\t\t\t\t\t\t</i>\n\t\t\t\n\t\t\t\n\t\t\t\t\t\t<i v-if=\"step.audioClipName!='Off'\" :title=\"step.audioClipName\" class=nowrap>\n\t\t\t\t\t\t\t<i class=\"fa fa-volume-up\"></i>\n\t\t\t\t\t\t\t<input class=\"digits-2\" v-model:value=\"step.audioVolume\">\n\t\t\t\t\t\t</i>\n\t\t\t\t\t</div>\n\t\t\t\t</draggable>\n\t\t\t</div>"
        }
    });
    //Key modifier:
    $(window).on('keydown keyup', function (e) {
        var status = "Save";
        var ctrlOrAlt = $$$.isMac ? e.altKey : e.ctrlKey;
        switch (true) {
            case ctrlOrAlt && e.shiftKey:
                status = "Recover";
                break;
            case e.shiftKey:
                status = "Trace";
                break;
            case ctrlOrAlt:
                status = "Clear";
                break;
        }
        __VUE.statusSaveButton = status;
        __VUE.statusKeyModifiers = (e.shiftKey ? __KEYS.SHIFT : 0) |
            (ctrlOrAlt ? __KEYS.CTRL : 0);
        //| (e.altKey ? __KEYS.ALT : 0);
        if (e.type == "keyup")
            return;
        var isEnter = false, isTab = false, isEscape = false;
        var ARROW_UP = 38, ARROW_DOWN = 40, ARROW_LEFT = 37, ARROW_RIGHT = 39;
        function tryFunc(name, e) {
            if (!__VUE.nav || !__VUE.nav[name])
                return null;
            return __VUE.nav[name](e);
        }
        switch (e.which) {
            case 27:
                isEscape = true;
                break;
            case 13:
                isEnter = true;
                break;
            case 9:
                isTab = true;
                break;
            case 67:
                if (ctrlOrAlt)
                    return tryFunc('onCopy', e);
                break;
            case 86:
                if (ctrlOrAlt)
                    return tryFunc('onPaste', e);
                break;
            case ARROW_UP: return tryFunc('goUp', e);
            case ARROW_DOWN: return tryFunc('goDown', e);
            case ARROW_LEFT: return tryFunc('goLeft', e);
            case ARROW_RIGHT: return tryFunc('goRight', e);
            default:
                if (__VUE.lastKeyPressed != e.which) {
                    __VUE.lastKeyPressed = e.which;
                    trace(e.which);
                }
                return;
        }
        __VUE.lastKeyPressed = e.which;
        //Handle the dropdown menus:
        if (__VUE.currentDropDown != null && isEscape) {
            return __VUE.currentDropDown = null;
        }
        if (__VUE.popup != null) {
            if (isEscape)
                return __VUE.popup = null;
            if (isEnter) {
                __VUE.popup.onEnter && __VUE.popup.onEnter();
                return __VUE.popup = null;
            }
        }
    });
    if ($$$.ftue) {
        $$$.ftue.init();
    }
    $(document).on('click', function (e) {
        if (!__VUE.currentDropDown)
            return;
        __VUE.currentDropDown = null;
    });
    $$$.Project = function Project() { };
    _.extend($$$.Project.prototype, {
        extendVue: function () {
            return {
                data: {
                    view: getCookie('view', 0),
                    currentLightItem: null,
                    currentActionItem: null,
                    currentDropDown: null,
                    currentSheetID: -1,
                    currentSheet: {},
                    currentRingStep: null,
                    currentStripStep: null,
                    statusKeyModifiers: 0,
                    statusSaveButton: 'Save',
                    nav: null,
                    isBusy: false,
                    forceWideView: getCookie('forceWideView') == 'true',
                    popup: null,
                    hardcoded: {},
                    jsonData: {
                        currentSheetName: '',
                        sheets: []
                    },
                    editFile: {
                        name: null,
                        data: null
                    }
                },
                updated: function () {
                    fixInputSelectable();
                    fixTextareaTabs();
                },
                computed: {
                    modes: function () {
                        return __VUE.hardcoded.LightStates;
                    },
                    audioClips: function () {
                        return __VUE.hardcoded.AudioClips;
                    },
                    audioClipsGithub: function () {
                        if (!__VUE.hardcoded.AudioClipsGithub) {
                            __VUE.hardcoded.AudioClipsGithub = [];
                        }
                        return __VUE.hardcoded.AudioClipsGithub;
                    },
                    editFileName: function () {
                        if (!this.editFile || !this.editFile.name)
                            return '';
                        return this.editFile.name.split('/').pop();
                    }
                },
                methods: {
                    changeView: function (id) {
                        $$$.vue.view = id;
                        setCookie('view', id);
                    },
                    trace: trace,
                    test: function () {
                        trace('test');
                    },
                    addLight: function () {
                        globalAddLight();
                    },
                    copyLight: function (item) {
                        this.currentLightItem = duplicateItem(item, __LIGHTS);
                        this.currentLightItem.name += " (Copy)";
                    },
                    removeLight: function (item) {
                        trace("remove light...");
                        removeItem(item, __LIGHTS, "currentLightItem");
                    },
                    addAction: function () {
                        globalAddAction();
                    },
                    copyAction: function (action) {
                        this.currentActionItem = duplicateItem(action, __ACTIONS);
                        this.currentActionItem.name += " (Copy)";
                    },
                    removeAction: function (item) {
                        removeItem(item, __ACTIONS, "currentActionItem");
                    },
                    addActionParam: function () {
                        globalAddActionParam();
                    },
                    removeActionParam: function (param) {
                        if (!this.currentActionItem)
                            return;
                        this.currentActionItem.params.remove(param);
                    },
                    copyActionParam: function (param) {
                        if (!this.currentActionItem)
                            return;
                        duplicateItem(param, this.currentActionItem.params);
                    },
                    handleSaveButton: function (e) {
                        if (this.isBusy)
                            return;
                        if (!$$$.isDataValid) {
                            $$$.boxError.showBox('Fix any data issues first before saving');
                            return;
                        }
                        this.isBusy = true;
                        switch (e.target.innerHTML) {
                            case 'Clear': return this.clearJSON();
                            case 'Recover': return this.recoverJSON();
                            case 'Trace':
                                this.isBusy = false;
                                return traceJSON();
                            default: return this.saveJSON();
                        }
                    },
                    saveJSON: function () {
                        projectCommand('saveJSON', JSON.stringify(__JSONDATA, null, ' '));
                    },
                    clearJSON: function () {
                        projectCommand('clearJSON', null);
                    },
                    recoverJSON: function () {
                        projectCommand('recoverJSON', null);
                    },
                    addSheet: function () {
                        createNewSheetAt(__SHEETS.length, null);
                        this.currentSheetUpdate(__SHEETS.length - 1);
                    },
                    renameSheet: function () {
                        var response = prompt("Rename the sheet to...", this.currentSheet.name);
                        this.currentSheet.name = response;
                    },
                    copySheet: function () {
                        var sheet = createNewSheetAt(__SHEETS.length, this.currentSheet);
                        sheet.name += " Copy";
                    },
                    removeSheet: function () {
                        if (!this.currentSheet || this.currentSheetID < 0)
                            return;
                        var id = this.jsonData.sheets.remove(this.currentSheet);
                        this.currentSheetID = -1;
                        this.currentSheetUpdate(id - 1);
                    },
                    exportSheetsPopup: function () {
                        showPopup("Export Sheet(s)", "Select the sheets you would like to export:", {
                            checkboxes: __SHEETS.map(function (sheet, id) { return { name: sheet.name, id: id }; }),
                            ok: function (options) {
                                //Filter out the uneeded sheets:
                                var mySheetIDs = options.checkboxes
                                    .filter(function (sheet) { return sheet.value; })
                                    .map(function (sheet) { return sheet.name; });
                                var mySheets = _.jsonClone(__SHEETS)
                                    .filter(function (sheet) { return mySheetIDs.has(sheet.name); });
                                //Now do a client-side file download:
                                downloadJSON({ sheets: mySheets }, $$$.projectName + ".json");
                            }
                        });
                    },
                    isSheetSelected: function (sheet) {
                        trace(sheet);
                        return true;
                    },
                    currentSheetUpdate: function (id) {
                        if (_.isObject(id)) {
                            id = $(id.target).data('index');
                        }
                        id = parseInt(id);
                        trace(this.currentSheetID + " : " + id);
                        setCookie('sheet', id);
                        if (this.currentSheetID === id)
                            return;
                        if (id < 0 || isNaN(id) || id >= __SHEETS.length)
                            id = 0;
                        if (!__SHEETS.length) {
                            trace("sheet is null!");
                            this.currentSheet = null;
                            return;
                        }
                        this.currentSheetID = id;
                        flashInterface();
                        if (__SHEETS == null)
                            return null;
                        var old = {
                            __SHEET: __SHEET,
                            __DEFS: __DEFS,
                            __LIGHTS: __LIGHTS,
                            __ACTIONS: __ACTIONS
                        };
                        __SHEET = __SHEETS[this.currentSheetID];
                        __DEFS = __SHEET.definableValues;
                        __LIGHTS = __SHEET.lightSequence;
                        __ACTIONS = __SHEET.actionSequence;
                        __JSONDATA.currentSheetName = __SHEET.name;
                        this.verifyLightCounts();
                        //Try to preserve the selection index:
                        this.currentActionItem = trySameIndex(__ACTIONS, old.__ACTIONS, this.currentActionItem);
                        this.currentLightItem = trySameIndex(__LIGHTS, old.__LIGHTS, this.currentLightItem);
                        $(window).trigger('vue-validate');
                        return this.currentSheet = __SHEET;
                    },
                    verifyLightCounts: function () {
                        var step, steps, lights, seq = !__LIGHTS || !__LIGHTS.length ? null : __LIGHTS[0];
                        if (!seq)
                            return;
                        //Default to 8, but check further to see if existing lights rings/strips don't match.
                        if (!__SHEET.numOfLights)
                            __SHEET.numOfLights = { ring: 8, strip: 8 };
                        _.keys(__SHEET.numOfLights).forEach(function (id, type) {
                            var prop = type + 'Steps';
                            steps = seq[prop];
                            if (!steps)
                                return;
                            step = steps[0];
                            lights = step.lights;
                            if (!lights || !lights.length)
                                return;
                            trace("Setting \"numOfLights." + type + "\" to match array count: " + lights.length);
                            __SHEET.numOfLights[type] = lights.length;
                        });
                    },
                    setCurrentDropDown: function (item) {
                        this.currentDropDown = item;
                    },
                    showPopup: function (header, message, options) {
                        showPopup(header, message, options);
                    },
                    onPopupDismiss: function (buttonName) {
                        var popup = this.popup;
                        var btn = popup.dismiss[buttonName];
                        this.popup = null;
                        if (btn == null)
                            return;
                        if (_.isFunction(btn))
                            btn(popup);
                    },
                    onForceWideView: function () {
                        setCookie('forceWideView', this.forceWideView);
                    },
                    playAll: function (e) {
                        stopEvent(e);
                        this.$refs.stripLight.playSequence();
                        this.$refs.ringLight.playSequence();
                    },
                    ///////////////////////////////////////////////
                    requestEditFile: function (filename) {
                        trace("Request: " + filename);
                        this.isBusy = true;
                        projectCommand('getEditFile', filename);
                    },
                    saveEditFile: function () {
                        if (this.isBusy)
                            return;
                        this.isBusy = true;
                        trace("Save the edit file...");
                        projectCommand('saveEditFile', this.editFile);
                    },
                    cancelEditFile: function () {
                        this.editFile = null;
                    },
                    onServerEditFile: function (fileObj) {
                        this.editFile = fileObj;
                    }
                }
            };
        },
        init: function (projectData) {
            __VUE = $$$.vue;
            __JSONDATA = __VUE.jsonData;
            __SHEETS = __JSONDATA.sheets;
            $(window).trigger("vue-ready");
            $$$.details = $('#details');
            $$$.views = $$$.details.find('.view');
            //$$$.
            fadeIn($$$.details, 0.2);
            //If we don't have any hardcoded data, forget the rest!
            //if(!checkHardcodedData(projectData)) return;
            if (!projectData || !projectData.json || !projectData.json) {
                $$$.boxError.showBox("Starting with fresh data... :--1:");
                createNewSheetAt(0, null);
            }
            else {
                _.jsonFixBooleans(projectData.json);
                __JSONDATA = __VUE.jsonData = projectData.json;
                __SHEETS = __JSONDATA.sheets;
            }
            __VUE.currentSheetUpdate(getCookie('sheet', 0));
            if (this.currentSheet) {
                __VUE.currentLightItem = __LIGHTS[getCookie('light', 0)];
                __VUE.currentActionItem = __ACTIONS[getCookie('action', 0)];
            }
            $$$.io.on('github-webhook', onGithubWebhook);
            $$$.io.on("server-error", function () { __VUE.isBusy = false; });
            $$$.io.on("hardcoded", checkHardcodedData);
            $$$.io.on("edit-file", __VUE.onServerEditFile);
            $$$.io.on('isBusy', function (status) {
                __VUE.isBusy = status;
            });
            loadSounds();
            loadNavBarMenu();
            projectCommand('getHardcoded');
            getGithubLiveData(function () { return __VUE.$forceUpdate(); });
            $('.init-hidden').removeClass('init-hidden');
        }
    });
    function loadSounds() {
        $$$.__media = $$$.projectName + '/media/';
        loadAudioSprite('audiosprite.json', $$$.__media, function (howl) { return $$$.audiosprite = howl; });
    }
    function trySameIndex(arrNew, arrOld, itemOld) {
        var first = arrNew[0];
        if (!arrOld || itemOld == null)
            return first;
        var id = arrOld.indexOf(itemOld);
        if (id == -1)
            return first;
        if (id >= arrNew.length)
            return first;
        return arrNew[id];
    }
    function checkHardcodedData(data) {
        if (!data || !data.hardcoded) {
            trace("NO HARDCODED DATA!");
            $$$.boxError.showBox('Oh no! We don\'t have any hardcoded data! :cry:');
            return;
        }
        __VUE.hardcoded = _.extend([], __VUE.hardcoded, data.hardcoded);
        __ARACOMMANDS = __VUE.hardcoded.AraCommands;
        trace(__VUE.hardcoded);
    }
    function createNewSheetAt(id, duplicate) {
        if (id == null)
            id = __JSONDATA.sheets.length;
        var sheet;
        trace("NEW DATA...");
        if (duplicate) {
            $$$.boxInfo.showBox("Duplicating Sheet...");
            //Do a quick JSON -to-and-from- to deep clone all the data without the Vue garbage around it.
            sheet = _.jsonClone(duplicate);
        }
        else {
            $$$.boxInfo.showBox("Creating New Sheet...");
            __SHEET = sheet = {
                name: "Sheet " + (__SHEETS.length + 1),
                numOfLights: null,
                definableValues: [],
                lightSequence: [],
                actionSequence: []
            };
            __DEFS = __SHEET.definableValues;
            __LIGHTS = __SHEET.lightSequence;
            __ACTIONS = __SHEET.actionSequence;
            sheet.definableValues.push({ type: 'numeric-prop', name: 'photoDistance', value: 5 }, { type: 'numeric-prop', name: 'elevationHeight', value: 1 }, { type: 'numeric-prop', name: 'elevationSpeed', value: 5 }, { type: 'numeric-prop', name: 'descentSpeed', value: 1 }, { type: 'numeric-prop', name: 'movementSpeed', value: 5 }, { type: 'numeric-prop', name: 'yawSpeed', value: 1 }, { type: 'numeric-prop', name: 'timeToStart', value: 5 }, { type: 'numeric-prop', name: 'timeToStop', value: 1 }, { type: 'numeric-prop', name: 'maxTiltRange', value: 5 }, { type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1 }, { type: 'numeric-prop', name: 'baseMass', value: 1 }, { type: 'numeric-prop', name: 'swingDampening', value: 1 });
            globalAddLight();
            globalAddAction();
        }
        __SHEETS[id] = sheet;
        this.currentSheetUpdate(id);
        return sheet;
    }
    function globalAddAction() {
        __ACTIONS.push({
            type: 'action-item',
            name: 'Action ' + (__ACTIONS.length + 1),
            params: [],
            time: 5
        });
        __VUE.currentActionItem = __ACTIONS.last();
        globalAddActionParam(); //Always add 1 scripted-action object first
    }
    function globalAddActionParam() {
        if (!__VUE.currentActionItem)
            return;
        __VUE.currentActionItem.params.push({
            type: __ARACOMMANDS[0].name,
            time: 1,
            waitForRing: false,
            waitForStrip: false,
            waitForYaw: false,
            elevation: 0
        });
        //traceJSON(__VUE.currentActionItem.params);
        //__VUE.currentActionItem
    }
    function removeItem(item, list, vueProperty) {
        if (item)
            return list.remove(item);
        if (!__VUE[vueProperty]) {
            traceError(vueProperty + " contains nothing!");
            return;
        }
        var id = list.remove(__VUE[vueProperty]) - 1;
        __VUE[vueProperty] = id < 0 ? (list.length > 0 ? list.first() : null) : list[id];
    }
    function loadNavBarMenu() {
        addMenu("\n\t\t\t<div class=\"menu\">\n\t\t\t\t<i title=\"Tools\">\n\t\t\t\t\t<i title=\"Convert LEDs to 12\" onclick=\"convertLEDs(12, 12)\"></i>\n\t\t\t\t\t<i title=\"Convert LEDs to 8\" onclick=\"convertLEDs(8, 8)\"></i>\n\t\t\t\t\t<i title=\"Convert LEDs to 12-ring and 2-strip\" onclick=\"convertLEDs(12, 2)\"></i>\n\t\t\t\t</i>\n\t\t\t\t<i title=\"Edit\">\n\t\t\t\t\t<i title=\"Hardcoded Data<br/>(WebPanel, Trigger, etc.)\" onclick=\"__VUE.requestEditFile('hardcoded.js')\"></i>\n\t\t\t\t\t\n\t\t\t\t</i>\n\t\t\t</div>\n\t\t"); //<i title="Raw Project JSON Data" onclick="requestEditFile('raw-project-json')"></i>
    }
})($$$);
function duplicateItem(item, list) {
    var id = list.indexOf(item);
    var dup = _.jsonClone(item);
    list.splice(id + 1, 0, dup);
    return dup;
}
function globalAddLight(lights, dontFocus) {
    if (lights === void 0) { lights = null; }
    if (dontFocus === void 0) { dontFocus = false; }
    if (!lights)
        lights = __LIGHTS;
    lights.push({
        type: 'light-item',
        name: 'Light ' + (lights.length + 1),
        ringSeqLooping: false,
        ringSeqHoldLast: false,
        ringSteps: [
            globalAddLightStep()
        ],
        stripSeqLooping: false,
        stripSeqHoldLast: false,
        stripSteps: [
            globalAddLightStep()
        ]
    });
    if (dontFocus)
        return;
    __VUE.currentLightItem = __LIGHTS.last();
}
function globalAddLightStep() {
    return {
        type: 'light-step',
        time: 1,
        audioClipName: "Off",
        audioVolume: 1.0,
        lights: _.jsonClone({ state: 'Full', color: '#fff' }, __JSONDATA.numOfLights)
    };
}
function globalAddLightState(lights) {
    lights.push({ state: 'Full', color: '#fff' });
}
function convertLEDs(ringCount, stripCount) {
    var numLights = __SHEET.numOfLights;
    if (ringCount == numLights.ring && stripCount == numLights.stripCount) {
        return $$$.boxError.showBox("~lightbulb-o fa-2x v-align-mid~ - Already using correct # of lights. (" + ringCount + ", " + stripCount + ")");
    }
    showPopup("Convert LEDs", "Are you sure you want to convert to " + ringCount + " rings & " + stripCount + " strips LEDs?", { ok: onOK });
    function onOK(options) {
        numLights = __SHEET.numOfLights = { ring: ringCount, strip: stripCount };
        //__SHEETS.forEach( sheet => forEachLightSeq(sheet.lightSequence) );
        forEachLightSeq(__SHEET.lightSequence);
        flashInterface();
        __VUE.$forceUpdate();
    }
    function forEachLightSeq(lightSequence) {
        lightSequence.forEach(function (seq) {
            seq.ringSteps.forEach(function (step) { return forEachLightSteps(step, numLights.ring); });
            seq.stripSteps.forEach(function (step) { return forEachLightSteps(step, numLights.strip); });
        });
    }
    function forEachLightSteps(step, numLEDs) {
        trace("numLEDs: " + numLEDs);
        if (!step.lights)
            step.lights = [];
        while (step.lights.length > numLEDs) {
            step.lights.pop();
        }
        while (step.lights.length < numLEDs) {
            globalAddLightState(step.lights);
        }
        trace(step);
    }
}
function getGithubLiveData(cb) {
    var filters = "nometa&noext&trim&include=**/*.(mp3|wav)";
    //Get AudioClips:
    $.ajax('/github/EggRollDigital/aevenavr/tree/vive/ara-vr/Assets/Resources/AudioClips?' + filters, {
        success: function (data) {
            //trace(data);
            __VUE.hardcoded.AudioClipsGithub = data.files.toKeyValues();
            //trace(__VUE.hardcoded.AudioClipsGithub);
            __VUE.$nextTick(cb);
        },
        error: function (err) {
            traceError(err);
            __VUE.$nextTick(cb);
        }
    });
}
function fixInputSelectable() {
    var $nodrag = $('.nodrag');
    $nodrag.each(function (id, element) {
        if (element._nodragFix)
            return;
        element._nodragFix = true;
        var $el = $(element);
        var $step = $el.closest('.ftue-step');
        $el.mousedown(function (e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            //stopEvent(e);
            $step.attr("draggable", false);
        });
        $el.mouseup(function (e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            //stopEvent(e);
            $step.attr("draggable", true);
        });
    });
}
function fixTextareaTabs() {
    var textareas = document.getElementsByTagName('textarea');
    var count = textareas.length;
    for (var i = 0; i < count; i++) {
        textareas[i].onkeydown = function (e) {
            if (e.keyCode == 9 || e.which == 9) {
                e.preventDefault();
                var s = this.selectionStart;
                this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                this.selectionEnd = s + 1;
            }
        };
    }
}
function onGithubWebhook(data) {
    var jsonHook = data.hook;
    var jsonRepo = data.repository;
    var jsonSender = data.sender;
    var repoName = jsonRepo.name;
    var socketMessage = [
        "<img src=\"" + jsonSender.avatar_url + "\" width=\"24px\" />",
        "<b>" + jsonSender.login + "</b> made changes to <b>" + repoName + "</b>",
        "  <i class=\"twn twn-bounce em em-mushroom\"></i>"
    ].join(' ');
    $$$.boxInfo.showBox(socketMessage);
    playSFX($$$.defaultSFX, 'mario_mushroom', 0.1);
}
function flashInterface() {
    TweenMax.fromTo($$$.details, 0.5, { alpha: 0 }, { alpha: 1 });
}
