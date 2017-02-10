/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />

declare var ERDS, _, $, $$$, Vue, TweenMax,
	trace, traceError, traceClear, setCookie;

var __JSONDATA, __KEYS = {SHIFT: 1, CTRL: 2, ALT: 4};

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

(function(ERDS) {
	var __VUE, __SHEETS, __SHEET, __DEFS, __LIGHTS, __ACTIONS;
	
	registerComponents({
		comp: {
			props: ['obj'],
			template:
				'<div class="v-comp" v-bind:is="obj.type" v-bind:obj="obj"></div>'
		},

		'view-tab': {
			props: [],
			template:
				'<div><slot></slot></div>'
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
			methods: {
				showPanel() {
					__VUE.currentLightItem = this.obj
				}
			},
			computed: {
				isSelected() {
					return {
						isSelected: __VUE.currentLightItem == this.obj
					}
				}
			},
			template:
				'<div class="light-item" :class="isSelected">\
					<btn label="Light Item" v-on:click="showPanel()" />\
				</div>'
		},

		'action-item': {
			props: ['obj'],
			methods: {
				addParam() {
					__VUE.currentActionItem = this.obj;
				}
			},
			template:
				'<div class="action-item">\
					<div class="strip-action">\
						<i>ScriptedAction <btn label="+ Param" v-on:click="addParam()"/></i>\
					</div>\
				</div>'
		},

		'action-item-panel': {
			props: ['item'],
			template:
				'<div class="panel">\
					Display Somekind of Action Panel here.\
				</div>'
		},

		'btn': {
			props: ['obj', 'label'],
			methods: { click() { this.$emit('click'); } },
			template:
				'<div class="btn" v-on:click="click">\
					<i v-html="label"></i>\
				</div>'
		}
	});

	ERDS.Project = function Project() {};
	
	
	$(window).on('keydown keyup', function(e) {
		var status = "Save";
		switch(true) {
			case e.ctrlKey && e.shiftKey: status = "Recover"; break;
			case e.ctrlKey: status = "Clear"; break;
		}

		__VUE.statusSaveButton = status;
		__VUE.statusKeyModifiers =	(e.shiftKey ? __KEYS.SHIFT : 0) |
									(e.ctrlKey ? __KEYS.CTRL : 0) |
									(e.altKey ? __KEYS.ALT : 0);		
	});
	
	_.extend(ERDS.Project.prototype, {
		extendVue(vueConfig) {
			return _.merge(vueConfig, {
				data: {
					view: !isNaN(getCookie('view')) ? getCookie('view') : 0,
					currentLightItem: null,
					currentActionItem: null,
					currentSheetID: -1,
					currentSheet: {},
					statusKeyModifiers: 0,
					statusSaveButton: 'Save',
					isBusy: false,
					jsonData: {
						sheets: []
					}
				},

				methods: {
					changeView(id) {
						ERDS.vue.view = id;
						setCookie('view', id);
					},

					test() {
						trace('test');
					},

					addLight() {
						var newLight = {type: 'light-item', name: 'photoDistance', value: 5};
						__LIGHTS.push(__VUE.currentLightItem = newLight);
					},

					addAction() {
						__ACTIONS.push(
							{type: 'action-item', name: 'photoDistance', value: 5}
						);
					},

					handleSaveButton(e) {
						if(this.isBusy) return;
						
						this.isBusy = true;
						if(e.ctrlKey && e.shiftKey) return this.recoverJSON();
						if(e.ctrlKey) return this.clearJSON();
						this.saveJSON();
					},

					saveJSON() {
						projectCommand('saveJSON', JSON.stringify(__JSONDATA, null, ' '));
					},

					clearJSON() {
						projectCommand('clearJSON', null);
					},

					recoverJSON() {
						projectCommand('recoverJSON', null);
					},
					
					currentSheetUpdate(id) {
						if(isNaN(id)) return;
						if(this.currentSheetID===id) return;
						
						id = parseInt(id);
						if(id<0 || isNaN(id)) id = 0;
						if(id>=__SHEETS.length) {
							createNewSheetAt(id);
						}
						
						this.currentSheetID = id;
						
						TweenMax.fromTo($$$.details, 0.5, {alpha:0}, {alpha:1});

						if(__SHEETS==null) return null;

						__SHEET = __SHEETS[this.currentSheetID];
						__DEFS = __SHEET.definableValues;
						__LIGHTS = __SHEET.lightSequence;
						__ACTIONS = __SHEET.actionSequence;
						
						return this.currentSheet = __SHEET;
					}
				}
			});
		},

		init(projectData) {
			__VUE = ERDS.vue;
			__JSONDATA = __VUE.jsonData;
			__SHEETS = __JSONDATA.sheets;

			$$$.details = $('#details');
			$$$.views = $$$.details.find('.view');

			fadeIn($$$.details, 0.2);
			
			if(!projectData || !projectData.json || !projectData.json) {
				$$$.boxError.showBox("Starting with fresh data... :--1:");
				
				demoPushExampleData();
			} else {
				__JSONDATA = __VUE.jsonData = projectData.json;
				__SHEETS = __JSONDATA.sheets;
			}

			__VUE.currentSheetUpdate(0);

			//Force-Reset the 'isBusy' status when an error occurs:
			ERDS.io.on("server-error", function() { __VUE.isBusy = false; });
			ERDS.io.on('isBusy', function(status) {
				__VUE.isBusy = status;
			});
			
			__VUE.$forceUpdate();
		}
	});

	function demoPushExampleData() {
		createNewSheetAt(0);
	}
	
	function createNewSheetAt(id, duplicate) {
		if(id==null) id = __JSONDATA.sheets.length;

		var sheet;
		
		if(duplicate) {
			$$$.boxInfo.showBox("Duplicating Sheet...");
			
			//Do a quick JSON -to-and-from- to deep clone all the data without the Vue garbage around it.
			var jsonStr = JSON.stringify(duplicate);
			sheet = JSON.parse(jsonStr);
		} else {
			$$$.boxInfo.showBox("Creating New Sheet...");
			
			sheet = { definableValues: [], lightSequence: [], actionSequence: [] };
			
			sheet.definableValues.push(
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

			sheet.lightSequence.push(
				{type: 'light-item', name: 'photoDistance', value: 5}
			);

			sheet.actionSequence.push(
				{type: 'action-item', name: 'First Action', time: 5, params: []}
			);
		}
		
		__JSONDATA.sheets[id] = sheet;
		
		return sheet;
	}
	
})(ERDS);

