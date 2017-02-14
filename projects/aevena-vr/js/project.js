/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />
var __VUE, __SHEETS, __SHEET, __DEFS, __LIGHTS, __ACTIONS, __ARACOMMANDS;
var __JSONDATA, __KEYS = { SHIFT: 1, CTRL: 2, ALT: 4 };
function traceJSON(obj) {
    if (obj === void 0) { obj = null; }
    var result = JSON.stringify(obj || __JSONDATA, null, ' ');
    trace(result);
    //$$$.boxInfo.show();
    //TweenMax.set($$$.boxInfo, {alpha: 1});
    //
    //trace( $$$.boxInfo[0] == $('.box-info')[0] );
    $$$.boxInfo.showBox(result);
    return result;
}
(function (ERDS) {
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
            template: '<div class="numeric-prop">\
					<div class="col-1">\
						<i v-html="obj.name.camelToTitleCase()"></i>:\
					</div>\
					<div class="col-2">\
						<input type="text" v-model:value="obj.value" />\
					</div>\
				</div>'
        },
        'light-item': {
            props: ['obj'],
            methods: {
                showPanel: function () {
                    __VUE.currentLightItem = this.obj;
                }
            },
            computed: {
                isSelected: function () {
                    return {
                        isSelected: __VUE.currentLightItem == this.obj
                    };
                }
            },
            template: '<div class="item light-item" :class="isSelected">\
					<btn :label="obj.name" v-on:click="showPanel()" />\
					<slot></slot>\
				</div>'
        },
        'action-item': {
            props: ['obj'],
            methods: {
                showPanel: function () {
                    __VUE.currentActionItem = this.obj;
                }
            },
            computed: {
                isSelected: function () {
                    return {
                        isSelected: __VUE.currentActionItem == this.obj
                    };
                }
            },
            template: '<div class="item action-item" :class="isSelected">\
					<btn :label="obj.name" v-on:click="showPanel()"></btn><slot></slot>\
				</div>'
        },
        'btn': {
            props: ['obj', 'label', 'emoji', 'icon'],
            methods: { click: function (e) { this.$emit('click', e); } },
            template: '<div class="btn" v-on:click.capture.stop.prevent="click">\
					<i v-if="emoji" :class="\'v-align-mid em em-\'+emoji" aria-hidden="true"></i>\
					<i v-if="icon" :class="\'v-align-mid icon fa fa-\'+icon" aria-hidden="true"></i>\
					<i v-html="label"></i>\
				</div>'
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
                    'currentColor': '#f00',
                    'currentStepID': 0,
                    'currentFocus': 'Colors'
                };
            },
            computed: {
                currentStepName: function () {
                    return 'current' + this.prefix + 'Step';
                },
                currentStep: function () {
                    if (this.currentStepID < 0 || this.currentStepID >= this.steps.length)
                        return null;
                    return this.steps[this.currentStepID];
                },
                isFocusColors: function () {
                    return this.currentFocus == "Colors";
                },
                modes: function () {
                    return __VUE.hardcoded.LightStates;
                },
                audioClips: function () {
                    return __VUE.hardcoded.AudioClips;
                },
                currentDropDown: function () {
                    return __VUE.currentDropDown;
                }
            },
            methods: {
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
                setStepID: function (id) {
                    this.currentStepID = id;
                    //__VUE[this.currentStepName] = this.steps[id];
                },
                setCurrentDropDown: function (item) {
                    __VUE.currentDropDown = item;
                },
                setCurrentFocus: function (e) {
                    var id = $(e.target).data('index');
                    if (isNaN(id))
                        return;
                    this.currentFocus = this.modes[id].name;
                },
                onClickBulb: function (light) {
                    if (this.isFocusColors) {
                        light.color = this.currentColor;
                        return;
                    }
                    light.state = this.currentFocus;
                },
                convertStateToChar: function (light) {
                    switch (light.state) {
                        case "Colors": return "!";
                        case "Off": return "_";
                        case "Full": return "#";
                        case "FadeIn": return "&uarr;";
                        case "FadeOut": return "&darr;";
                    }
                },
                setCurrentAudio: function (e) {
                    if (!this.currentStep)
                        return;
                    var el = $(e.target);
                    this.currentStep.audio = String(el[0].innerHTML);
                }
            },
            template: "\n\t\t\t<div class=\"padded-3 subpanel\">\n\t\t\t\t<i class=\"subheader nowrap v-align-mid-kids\">\n\t\t\t\t\t<i v-html=\"header\"></i>\n\n\t\t\t\t\t<i class=\"spacer-1\">\n\t\t\t\t\t\t<input type=\"checkbox\" v-model:value=\"obj[loops]\"> &nbsp;\n\t\t\t\t\t\t<i class=\"fa fa-refresh v-align-mid\" title=\"Looping\"></i>\n\t\t\t\t\t</i>\n\n\t\t\t\t\t<i class=\"spacer-1\">\n\t\t\t\t\t\t<input type=\"checkbox\" v-model:value=\"obj[holds]\"> &nbsp;\n\t\t\t\t\t\t<i class=\"fa fa-pause v-align-mid\" title=\"Hold Last\"></i>\n\t\t\t\t\t</i>\n\n\t\t\t\t\t<i class=\"break\">\n\t\t\t\t\t\t<btn class=\"\" icon=\"plus-square\" label=\"Step\" @click=\"addStep\"></btn>\n\t\t\t\t\t\t<btn class=\"\" icon=\"play\"></btn>\n\t\t\t\t\t</i>\n\t\t\t\t</i>\n\n\t\t\t\t<br/>\n\n\t\t\t\t<div class=\"light-comp\" v-if=\"currentStep\" :class=\"class_lightcomp\">\n\t\t\t\t\t<!-- Audio -->\n\t\t\t\t\t<span class=\"dropdown\">\n\t\t\t\t\t\t<btn class=\"padded-5 audio\"\n\t\t\t\t\t\t\t @click=\"setCurrentDropDown(steps)\"\n\t\t\t\t\t\t\t icon=\"volume-up\">\n\t\t\t\t\t\t</btn>\n\t\t\t\t\t\t<div class=\"dropdown-list audio-list\"\n\t\t\t\t\t\t\t v-if=\"currentDropDown==steps\"\n\t\t\t\t\t\t\t @click=\"setCurrentAudio($event)\">\n\t\t\t\t\t\t\t<div v-for=\"(item, id) in audioClips\"\n\t\t\t\t\t\t\t\tv-html=\"item.name\"\n\t\t\t\t\t\t\t\t:class=\"{isSelected: currentStep.audio==item.name}\"\n\t\t\t\t\t\t\t\t:data-index=\"id\"></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</span>\n\n\t\t\t\t\t<input class=\"padded-2\" v-model:value=\"currentStep.audio\">\n\n\t\t\t\t\t<br/>\n\n\t\t\t\t\t<i class=\"nowrap\">\n\t\t\t\t\t\t<span class=\"dropdown\">\n\t\t\t\t\t\t\t<btn class=\"padded-5 color-names\"\n\t\t\t\t\t\t\t\t @click=\"setCurrentDropDown(currentStep)\"\n\t\t\t\t\t\t\t\t icon=\"paint-brush\">\n\t\t\t\t\t\t\t</btn>\n\t\t\t\t\t\t\t<div class=\"dropdown-list step-modes\"\n\t\t\t\t\t\t\t\t v-if=\"currentDropDown==currentStep\"\n\t\t\t\t\t\t\t\t @click=\"setCurrentFocus($event)\">\n\t\t\t\t\t\t\t\t<div v-for=\"(item, id) in modes\"\n\t\t\t\t\t\t\t\t\tv-html=\"item.name\"\n\t\t\t\t\t\t\t\t\t:class=\"{isSelected: currentFocus==item.name}\"\n\t\t\t\t\t\t\t\t\t:data-index=\"id\"></div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</span>\n\n\t\t\t\t\t\t<i v-if=\"isFocusColors\">\n\t\t\t\t\t\t\t<i class=\"spacer-1\">Color:</i>\n\t\t\t\t\t\t\t<input class=\"color-picker\"\n\t\t\t\t\t\t\t\t\t:style=\"{backgroundColor: currentColor}\"\n\t\t\t\t\t\t\t\t\tv-model:value=\"currentColor\">\n\t\t\t\t\t\t</i>\n\n\t\t\t\t\t\t<i v-if=\"!isFocusColors\">\n\t\t\t\t\t\t\tPainting: \"{{currentFocus}}\"\n\t\t\t\t\t\t</i>\n\t\t\t\t\t</i>\n\n\n\n\t\t\t\t\t<!-- Draw Actual Component -->\n\t\t\t\t\t<div class=\"center\">\n\t\t\t\t\t\t<i v-for=\"(light, id) in currentStep.lights\"\n\t\t\t\t\t\t\t:class=\"['bulb', 'bulb-'+id, 'bulb-'+light.state.toLowerCase()]\"\n\t\t\t\t\t\t\t:style=\"{backgroundColor: light.color}\"\n\t\t\t\t\t\t\t@click=\"onClickBulb(light)\">\n\t\t\t\t\t\t\t</i>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<draggable class=\"steps\" :list=\"steps\" :options=\"{ handle: '.drag-handle' }\">\n\t\t\t\t\t<div class=\"step\"\n\t\t\t\t\t\t:class=\"{isSelected: currentStepID==id}\"\n\t\t\t\t\t\t@click=\"setStepID(id)\"\n\t\t\t\t\t\tv-for=\"(step, id) in steps\">\n\t\t\t\t\t\t<btn icon=\"trash-o\" @click=\"removeStep(step)\"></btn>\n\t\t\t\t\t\t<btn icon=\"clone\" @click=\"copyStep(step)\"></btn>\n\t\t\t\t\t\t<btn icon=\"sort\" class=\"drag-handle\" title=\"Sort param\"></btn>\n\n\t\t\t\t\t\t<i>Time:</i>\n\t\t\t\t\t\t<input class=\"digits-3\" v-model:value=\"step.time\">\n\n\t\t\t\t\t\t<i class=\"bulb-short bulb-statuses\" v-for=\"(light, id) in step.lights\">\n\t\t\t\t\t\t\t<i class=\"bulb-stat\"\n\t\t\t\t\t\t\t\t:style=\"{color: light.color}\"\n\t\t\t\t\t\t\t\tv-html=\"convertStateToChar(light)\">\n\t\t\t\t\t\t\t</i>\n\t\t\t\t\t\t</i>\n\t\t\t\t\t</div>\n\t\t\t\t</draggable>\n\t\t\t</div>\n\t\t\t"
        }
    });
    //Key modifier:
    $(window).on('keydown keyup', function (e) {
        var status = "Save";
        var ctrlOrAlt = ERDS.isMac ? e.altKey : e.ctrlKey;
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
        //Handle the dropdown menus:
        if (__VUE.currentDropDown != null) {
            switch (e.which) {
                case 13: // __VUE.currentDropDown = null; return;
                case 9: // __VUE.currentDropDown = null; return;
                //ESCAPE
                case 27:
                    __VUE.currentDropDown = null;
                    return;
            }
            trace(e.which);
        }
    });
    $(document).on('click', function (e) {
        if (!__VUE.currentDropDown)
            return;
        __VUE.currentDropDown = null;
    });
    ERDS.Project = function Project() { };
    _.extend(ERDS.Project.prototype, {
        extendVue: function (vueConfig) {
            return _.merge(vueConfig, {
                data: {
                    view: !isNaN(getCookie('view')) ? getCookie('view') : 0,
                    currentLightItem: null,
                    currentActionItem: null,
                    currentDropDown: null,
                    currentSheetID: -1,
                    currentSheet: {},
                    currentRingStep: null,
                    currentStripStep: null,
                    statusKeyModifiers: 0,
                    statusSaveButton: 'Save',
                    isBusy: false,
                    hardcoded: {},
                    jsonData: {
                        sheets: []
                    }
                },
                methods: {
                    changeView: function (id) {
                        ERDS.vue.view = id;
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
                    createNewSheet: function () {
                        this.currentSheetUpdate(__SHEETS.length);
                    },
                    currentSheetUpdate: function (id) {
                        if (_.isObject(id) && id.target) {
                            id = $(id.target).data('index');
                        }
                        id = parseInt(id);
                        trace(this.currentSheetID + " : " + id);
                        if (this.currentSheetID === id)
                            return;
                        if (id < 0 || isNaN(id))
                            id = 0;
                        if (id >= __SHEETS.length) {
                            createNewSheetAt(__SHEETS.length, null);
                        }
                        this.currentSheetID = id;
                        TweenMax.fromTo($$$.details, 0.5, { alpha: 0 }, { alpha: 1 });
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
                        //Try to preserve the selection index:
                        this.currentActionItem = trySameIndex(__ACTIONS, old.__ACTIONS, this.currentActionItem);
                        this.currentLightItem = trySameIndex(__LIGHTS, old.__LIGHTS, this.currentLightItem);
                        return this.currentSheet = __SHEET;
                    },
                    setCurrentDropDown: function (item) {
                        this.currentDropDown = item;
                    },
                    selectActionType: function (actionParam, e) {
                        var index = $(e.target).data('index');
                        if (isNaN(index) || index >= __ARACOMMANDS.length)
                            return;
                        actionParam.type = __ARACOMMANDS[index].name;
                    },
                    useSuggestedName: function (light, e, list, prefix) {
                        if (!prefix)
                            prefix = "";
                        var index = $(e.target).data('index');
                        if (isNaN(index) || index >= list.length)
                            return;
                        light.name = prefix + list[index].name;
                    }
                }
            });
        },
        init: function (projectData) {
            __VUE = ERDS.vue;
            __JSONDATA = __VUE.jsonData;
            __SHEETS = __JSONDATA.sheets;
            $$$.details = $('#details');
            $$$.views = $$$.details.find('.view');
            //$$$.
            fadeIn($$$.details, 0.2);
            //If we don't have any hardcoded data, forget the rest!
            if (!checkHardcodedData(projectData))
                return;
            if (!projectData || !projectData.json || !projectData.json) {
                $$$.boxError.showBox("Starting with fresh data... :--1:");
                createNewSheetAt(0, null);
            }
            else {
                __JSONDATA = __VUE.jsonData = projectData.json;
                __SHEETS = __JSONDATA.sheets;
            }
            __VUE.currentSheetUpdate(0);
            //Force-Reset the 'isBusy' status when an error occurs:
            ERDS.io.on("server-error", function () { __VUE.isBusy = false; });
            ERDS.io.on('isBusy', function (status) {
                __VUE.isBusy = status;
            });
            __VUE.$forceUpdate();
        }
    });
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
    function checkHardcodedData(projectData) {
        if (!projectData || !projectData.hardcoded) {
            trace("NO HARDCODED DATA!");
            $$$.boxError.showBox('Oh no! We don\'t have any hardcoded data! :cry:');
            return false;
        }
        __VUE.hardcoded = projectData.hardcoded;
        __ARACOMMANDS = __VUE.hardcoded.AraCommands;
        return true;
    }
    function createNewSheetAt(id, duplicate) {
        if (id == null)
            id = __JSONDATA.sheets.length;
        var sheet;
        trace("NEW DATA...");
        if (duplicate) {
            $$$.boxInfo.showBox("Duplicating Sheet...");
            //Do a quick JSON -to-and-from- to deep clone all the data without the Vue garbage around it.
            var jsonStr = JSON.stringify(duplicate);
            sheet = JSON.parse(jsonStr);
        }
        else {
            $$$.boxInfo.showBox("Creating New Sheet...");
            __SHEET = sheet = { name: "Sheet " + (__SHEETS.length + 1), definableValues: [], lightSequence: [], actionSequence: [] };
            __DEFS = __SHEET.definableValues;
            __LIGHTS = __SHEET.lightSequence;
            __ACTIONS = __SHEET.actionSequence;
            sheet.definableValues.push({ type: 'numeric-prop', name: 'photoDistance', value: 5 }, { type: 'numeric-prop', name: 'elevationHeight', value: 1 }, { type: 'numeric-prop', name: 'elevationSpeed', value: 5 }, { type: 'numeric-prop', name: 'descentSpeed', value: 1 }, { type: 'numeric-prop', name: 'movementSpeed', value: 5 }, { type: 'numeric-prop', name: 'yawSpeed', value: 1 }, { type: 'numeric-prop', name: 'timeToStart', value: 5 }, { type: 'numeric-prop', name: 'timeToStop', value: 1 }, { type: 'numeric-prop', name: 'maxTiltRange', value: 5 }, { type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1 });
            globalAddLight();
            globalAddAction();
        }
        __SHEETS[id] = sheet;
        return sheet;
    }
    function globalAddLight() {
        __LIGHTS.push({
            type: 'light-item',
            name: 'Light ' + (__LIGHTS.length + 1),
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
        __VUE.currentLightItem = __LIGHTS.last();
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
    function globalAddLightStep() {
        return {
            type: 'light-step',
            time: 1,
            audio: "Off",
            lights: [
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
                { state: 'Full', color: '#f00' },
            ]
        };
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
    function duplicateItem(item, list) {
        var id = list.indexOf(item);
        var dup = _.jsonClone(item);
        list.splice(id + 1, 0, dup);
        return dup;
    }
})(ERDS);
