"use strict";
function traceJSON() {
    trace(JSON.stringify(ERDS.data.jsonData, null, ' '));
}
var definableValues, lightSequence, actionSequence;
registerComponents({
    comp: {
        props: ['obj'],
        template: '<div class="v-comp" v-bind:is="obj.type" v-bind:obj="obj"></div>'
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
        template: '<div class="light-item">\
				<div class="ring-sequence">\
					Ring Sequence\
				</div>\
				<div class="strip-sequence">\
					Strip Sequence\
				</div>\
			</div>'
    },
    'action-item': {
        props: ['obj'],
        methods: {
            click: function () { this.$emit('click'); }
        },
        template: '<div class="action-item">\
				<div class="strip-action">\
					<i>ScriptedAction <btn label="Add Parameter" v-on:click="click"/></i>\
				</div>\
			</div>'
    },
    'btn': {
        props: ['obj', 'label'],
        methods: {
            click: function () { this.$emit('click'); }
        },
        template: '<div class="btn" v-on:click="click">\
				<i v-html="label"></i>\
			</div>'
    }
});
function demoPushExampleData() {
    ERDS.data.jsonData.definableValues.push({ type: 'numeric-prop', name: 'photoDistance', value: 5 }, { type: 'numeric-prop', name: 'elevationHeight', value: 1 }, { type: 'numeric-prop', name: 'elevationSpeed', value: 5 }, { type: 'numeric-prop', name: 'descentSpeed', value: 1 }, { type: 'numeric-prop', name: 'movementSpeed', value: 5 }, { type: 'numeric-prop', name: 'yawSpeed', value: 1 }, { type: 'numeric-prop', name: 'timeToStart', value: 5 }, { type: 'numeric-prop', name: 'timeToStop', value: 1 }, { type: 'numeric-prop', name: 'maxTiltRange', value: 5 }, { type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1 });
    ERDS.data.jsonData.lightSequence.push({ type: 'light-item', name: 'photoDistance', value: 5 });
    ERDS.data.jsonData.actionSequence.push({ type: 'action-item', name: 'photoDistance', value: 5 }, { type: 'action-item', name: 'elevationHeight', value: 1 });
}
var Project = (function () {
    function Project() {
    }
    Project.prototype.extendVue = function (vueConfig) {
        var projConfig = {
            data: {
                view: !isNaN(getCookie('view')) ? getCookie('view') : 0,
                jsonData: {
                    definableValues: [],
                    lightSequence: [],
                    actionSequence: []
                }
            },
            methods: {
                changeView: function (id) {
                    ERDS.vue.view = id;
                    trace(id + ' stored');
                    setCookie('view', id);
                },
                test: function () {
                    trace('test');
                },
                addLight: function () {
                    lightSequence.push({ type: 'light-item', name: 'photoDistance', value: 5 });
                },
                addAction: function () {
                    actionSequence.push({ type: 'action-item', name: 'photoDistance', value: 5 });
                }
            }
        };
        trace(getCookie('view'));
        var temp = _.merge(vueConfig, projConfig);
        ERDS.data = temp.data;
        return temp;
    };
    Project.prototype.init = function () {
        $$$.details = $('#details');
        $$$.views = $$$.details.find('.view');
        fadeIn($$$.details, 0.2);
        demoPushExampleData();
        definableValues = ERDS.data.jsonData.definableValues;
        lightSequence = ERDS.data.jsonData.lightSequence;
        actionSequence = ERDS.data.jsonData.actionSequence;
        ERDS.vue.$forceUpdate();
    };
    return Project;
})();
ERDS.Project = Project;
