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
				'<div class="item light-item" :class="isSelected">\
					<btn :label="obj.name" v-on:click="showPanel()" />\
				</div>'
		},

		'action-item': {
			props: ['obj'],
			methods: {
				showPanel() {
					__VUE.currentActionItem = this.obj
				}
			},
			computed: {
				isSelected() {
					return {
						isSelected: __VUE.currentActionItem == this.obj
					}
				}
			},
			template:
				'<div class="item action-item" :class="isSelected">\
					<btn :label="obj.name" v-on:click="showPanel()" />\
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

	//Key modifier:
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

	ERDS.Project = function Project() {};
	
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
					hardcoded: {},
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
						__LIGHTS.push({type: 'light-item', name: 'Light ' + (__LIGHTS.length+1), value: 5});
						__VUE.currentLightItem = __LIGHTS.last();
					},

					addAction() {
						__ACTIONS.push({type: 'action-item', name: 'Action ' + (__ACTIONS.length+1), value: 5});
						__VUE.currentActionItem = __ACTIONS.last();
					},

					addActionParam() {
						trace("Adding a parameter");
						//__VUE.currentActionItem = this.obj;
					},

					removeLight() {
						if(!this.currentLightItem) return;
						var id = __LIGHTS.remove(this.currentLightItem) - 1;
						this.currentLightItem = id<0 ? null : __LIGHTS[id];
					},
					
					removeAction() {
						if(!this.currentActionItem) return;
						var id = __ACTIONS.remove(this.currentActionItem) - 1;
						this.currentActionItem = id<0 ? null : __ACTIONS[id];
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
							createNewSheetAt(id, null);
						}

						this.currentSheetID = id;
						TweenMax.fromTo($$$.details, 0.5, {alpha:0}, {alpha:1});

						if(__SHEETS==null) return null;

						var old = {
							__SHEET:__SHEET,
							__DEFS:__DEFS,
							__LIGHTS:__LIGHTS,
							__ACTIONS:__ACTIONS
						};
						
						__SHEET = __SHEETS[this.currentSheetID];
						__DEFS = __SHEET.definableValues;
						__LIGHTS = __SHEET.lightSequence;
						__ACTIONS = __SHEET.actionSequence;
						
						//Try to preserve the selection index:
						this.currentActionItem = trySameIndex(__ACTIONS, old.__ACTIONS, this.currentActionItem);
						this.currentLightItem = trySameIndex(__LIGHTS, old.__LIGHTS, this.currentLightItem);
						//this.currentLightItem = __LIGHTS[0];


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

				createNewSheetAt(0, null);
			} else {
				__JSONDATA = __VUE.jsonData = projectData.json;
				__SHEETS = __JSONDATA.sheets;
			}
			
			//If we don't have any hardcoded data, forget the rest!
			if(!checkHardcodedData(projectData)) return;

			__VUE.currentSheetUpdate(0);

			//Force-Reset the 'isBusy' status when an error occurs:
			ERDS.io.on("server-error", function() { __VUE.isBusy = false; });
			ERDS.io.on('isBusy', function(status) {
				__VUE.isBusy = status;
			});
			
			__VUE.$forceUpdate();
		}
	});
	
	function trySameIndex(arrNew, arrOld, itemOld) {
		var first = arrNew[0];
		if(!arrOld || itemOld==null) return first;
		
		var id = arrOld.indexOf(itemOld);
		if(id==-1) return first;
		if(id>=arrNew.length) return first;
		return arrNew[id];
	}

	function checkHardcodedData(projectData) {
		if(!projectData || !projectData.hardcoded) {
			$$$.boxError.showBox('Oh no! We don\'t have any hardcoded data! :cry:');
			return false;
		}
		
		$$$.boxInfo.showBox('Found the hardcoded data! :smile: :--1: :--1: :--1:');
		__VUE.hardcoded = projectData.hardcoded;
		
		return true;
	}
	
	function createNewSheetAt(id, duplicate) {
		if(id==null) id = __JSONDATA.sheets.length;

		var sheet;

		trace("NEW DATA...");
		
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
				{type: 'light-item', name: 'Light 1', value: 5}
			);

			sheet.actionSequence.push(
				{type: 'action-item', name: 'Action 1', time: 5, params: []}
			);
		}
		
		__JSONDATA.sheets[id] = sheet;
		
		return sheet;
	}
	
})(ERDS);

