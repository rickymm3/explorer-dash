"use strict";

declare var ERDS, _, $, $$$, Vue,
	trace, traceError, traceClear,
	registerComponents, fadeIn,
	getCookie, setCookie;

function traceJSON() {
	trace(JSON.stringify(ERDS.data.jsonData, null, ' '));
}

registerComponents({
	comp: {
		props: ['obj'],
		template:
			'<div class="v-comp" v-bind:is="obj.type" v-bind:obj="obj"></div>'
	},

	'numeric-prop': {
		props: ['obj'],
		template:
			'<div class="numeric-prop">\
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
		template:
			'<div class="light-item">\
				<div class="col-1">\
					<i v-html="obj.name.camelToTitleCase()"></i>:\
				</div>\
				<div class="col-2">\
					<input type="text" v-model:value="obj.value" />\
				</div>\
			</div>'
	},

	'btn': {
		props: ['obj', 'label'],
		methods: {
			click() {
				this.$emit('click');
			}
		},
		
		template:
			'<div class="btn">\
				<i v-html="label" v-on:click="click"></i>\
			</div>'
	}
});

function demoPushExampleData() {
	ERDS.data.jsonData.definableValues.push(
		{type: 'numeric-prop', name: 'photoDistance', value: 5},
		{type: 'numeric-prop', name: 'elevationHeight', value: 1},
		{type: 'numeric-prop', name: 'elevationSpeed', value: 5},
		{type: 'numeric-prop', name: 'descentSpeed', value: 1},
		{type: 'numeric-prop', name: 'movementSpeed', value: 5},
		{type: 'numeric-prop', name: 'yawSpeed', value: 1},
		{type: 'numeric-prop', name: 'timeToStart', value: 5},
		{type: 'numeric-prop', name: 'timeToStop', value: 1},
		{type: 'numeric-prop', name: 'maxTiltRange', value: 5},
		{type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1}
	);

	ERDS.data.jsonData.lightSequence.push(
		{type: 'numeric-prop', name: 'photoDistance', value: 5}
	);

	ERDS.data.jsonData.actionSequence.push(
		{type: 'numeric-prop', name: 'photoDistance', value: 5},
		{type: 'numeric-prop', name: 'elevationHeight', value: 1}
	);
}

class Project {
	extendVue(vueConfig) {
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
				changeView(id) {
					ERDS.vue.view = id;
					trace(id + ' stored');
					setCookie('view', id);
				},
				
				test() {
					trace('test');
				},

				addLight() {
					trace("Adding a light");
				},
				
				addAction() {
					trace("Adding an Action");
				}
			}
		};
		
		trace(getCookie('view'));

		var temp = _.merge(vueConfig, projConfig);
		ERDS.data = temp.data;

		return temp;
	}

	init() {
		$$$.details = $('#details');
		$$$.views = $$$.details.find('.view');

		fadeIn($$$.details, 0.2);

		demoPushExampleData();

		ERDS.vue.$forceUpdate();
	}
}

ERDS.Project = Project;
