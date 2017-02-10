/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />
var __JSONDATA;
function traceJSON() {
    var result = JSON.stringify(__JSONDATA, null, ' ');
    //trace(result);
    //$$$.boxInfo.show();
    //TweenMax.set($$$.boxInfo, {alpha: 1});
    //
    //trace( $$$.boxInfo[0] == $('.box-info')[0] );
    $$$.boxInfo.showBox(result);
    return result;
}
(function (ERDS) {
    var __VUE, __DEFS, __LIGHTS, __ACTIONS;
    registerComponents({
        comp: {
            props: ['obj'],
            template: '<div class="v-comp" v-bind:is="obj.type" v-bind:obj="obj"></div>'
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
            template: '<div class="light-item" :class="isSelected">\
					<btn label="Light Item" v-on:click="showPanel()" />\
				</div>'
        },
        'action-item': {
            props: ['obj'],
            methods: {
                addParam: function () {
                    __VUE.currentActionItem = this.obj;
                }
            },
            template: '<div class="action-item">\
					<div class="strip-action">\
						<i>ScriptedAction <btn label="+ Param" v-on:click="addParam()"/></i>\
					</div>\
				</div>'
        },
        'action-item-panel': {
            props: ['item'],
            template: '<div class="panel">\
					Display Somekind of Action Panel here.\
				</div>'
        },
        'btn': {
            props: ['obj', 'label'],
            methods: { click: function () { this.$emit('click'); } },
            template: '<div class="btn" v-on:click="click">\
					<i v-html="label"></i>\
				</div>'
        }
    });
    ERDS.Project = function Project() { };
    _.extend(ERDS.Project.prototype, {
        extendVue: function (vueConfig) {
            return _.merge(vueConfig, {
                data: {
                    view: !isNaN(getCookie('view')) ? getCookie('view') : 0,
                    currentLightItem: null,
                    currentActionItem: null,
                    jsonData: {
                        definableValues: [],
                        lightSequence: [],
                        actionSequence: []
                    }
                },
                methods: {
                    changeView: function (id) {
                        ERDS.vue.view = id;
                        setCookie('view', id);
                    },
                    test: function () {
                        trace('test');
                    },
                    addLight: function () {
                        var newLight = { type: 'light-item', name: 'photoDistance', value: 5 };
                        __LIGHTS.push(__VUE.currentLightItem = newLight);
                    },
                    addAction: function () {
                        __ACTIONS.push({ type: 'action-item', name: 'photoDistance', value: 5 });
                    },
                    handleSaveButton: function (e) {
                        if (e.ctrlKey)
                            return this.clearJSON();
                        this.saveJSON();
                    },
                    saveJSON: function () {
                        //traceJSON();
                        //$.post({
                        //	url: "./json",
                        //	method: ""
                        //})
                        var jsonStr = JSON.stringify(__JSONDATA, null, ' ');
                        trace(jsonStr);
                        projectCommand('saveJSON', jsonStr);
                    },
                    clearJSON: function () {
                        trace("Clear JSON please.");
                    }
                }
            });
        },
        init: function () {
            __VUE = ERDS.vue;
            __JSONDATA = __VUE.jsonData;
            $$$.details = $('#details');
            $$$.views = $$$.details.find('.view');
            fadeIn($$$.details, 0.2);
            demoPushExampleData();
            __DEFS = __JSONDATA.definableValues;
            __LIGHTS = __JSONDATA.lightSequence;
            __ACTIONS = __JSONDATA.actionSequence;
            __VUE.$forceUpdate();
        }
    });
    function demoPushExampleData() {
        __JSONDATA.definableValues.push({ type: 'numeric-prop', name: 'photoDistance', value: 5 }, { type: 'numeric-prop', name: 'elevationHeight', value: 1 }, { type: 'numeric-prop', name: 'elevationSpeed', value: 5 }, { type: 'numeric-prop', name: 'descentSpeed', value: 1 }, { type: 'numeric-prop', name: 'movementSpeed', value: 5 }, { type: 'numeric-prop', name: 'yawSpeed', value: 1 }, { type: 'numeric-prop', name: 'timeToStart', value: 5 }, { type: 'numeric-prop', name: 'timeToStop', value: 1 }, { type: 'numeric-prop', name: 'maxTiltRange', value: 5 }, { type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1 });
        __JSONDATA.lightSequence.push({ type: 'light-item', name: 'photoDistance', value: 5 });
        __JSONDATA.actionSequence.push({ type: 'action-item', name: 'First Action', time: 5, params: [] });
    }
})(ERDS);
