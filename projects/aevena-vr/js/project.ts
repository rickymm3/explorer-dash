/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />

declare var ERDS, _, $, $$$, Vue, TweenMax,
	trace, traceError, traceClear;

var __VUE, __SHEETS, __SHEET, __DEFS, __LIGHTS, __ACTIONS, __ARACOMMANDS;
var __JSONDATA, __KEYS = {SHIFT: 1, CTRL: 2, ALT: 4};

function traceJSON(obj=null) {
	var result = JSON.stringify(obj || __JSONDATA, null, ' ');
	trace(result);
	
	//$$$.boxInfo.show();
	//TweenMax.set($$$.boxInfo, {alpha: 1});
	//
	//trace( $$$.boxInfo[0] == $('.box-info')[0] );
	$$$.boxInfo.showBox(result);
	return result;
}

(function(ERDS) {
	registerComponents({
		comp: {
			props: ['obj'],
			template:
				'<div class="v-comp" v-bind:is="obj.type" v-bind:obj="obj"><slot></slot></div>'
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
					<slot></slot>\
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
					<btn :label="obj.name" v-on:click="showPanel()"></btn><slot></slot>\
				</div>'
		},

		'btn': {
			props: ['obj', 'label', 'emoji', 'icon'],
			methods: { click(e) { this.$emit('click', e); } },
			template:
				'<div class="btn" v-on:click.capture.stop.prevent="click">\
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

			data() {
				return {
					'currentStepID': 0,
				};
			},

			computed: {
				currentStepName() {
					return 'current'+this.prefix+'Step';
				},

				currentStep() {
					if(this.currentStepID<0 || this.currentStepID>=this.steps.length) return null;
					return this.steps[this.currentStepID];
				}
			},

			methods: {

				addStep() {
					trace("Add step...");
				},

				copyStep(item) {
					__VUE[this.currentStepName] = duplicateItem(item, this.steps);
					//this.currentLightItem.name += " (Copy)";
				},

				removeStep(item) {
					removeItem(item, this.steps, this.currentStepName);
				},

				setStepID(id) {
					this.currentStepID = id;
					//__VUE[this.currentStepName] = this.steps[id];
				}
			},

			template: `
			<div class="padded-3 subpanel">
				<i class="subheader nowrap v-align-mid-kids">
					<i v-html="header"></i>

					<i class="spacer-1">
						<input type="checkbox" v-model:value="obj[loops]"> &nbsp;
						<i class="fa fa-refresh v-align-mid" title="Looping"></i>
					</i>

					<i class="spacer-1">
						<input type="checkbox" v-model:value="obj[holds]"> &nbsp;
						<i class="fa fa-pause v-align-mid" title="Hold Last"></i>
					</i>

					<i class="break">
						<btn class="" icon="plus-square" label="Step" @click="addStep"></btn>
						<btn class="" icon="play"></btn>
					</i>
				</i>

				<br/>

				<div class="light-comp" v-if="currentStep" :class="class_lightcomp">
					<btn class="audio" icon="volume-up"></btn>
					<input class="" v-model:value="currentStep.audio">

					<div class="center">
						<i class="bulb bulb-0" :style="{color: currentStep.lights[0].color}"></i>
						<i class="bulb bulb-1"></i>
						<i class="bulb bulb-2"></i>
						<i class="bulb bulb-3"></i>
						<i class="bulb bulb-4"></i>
						<i class="bulb bulb-5"></i>
						<i class="bulb bulb-6"></i>
						<i class="bulb bulb-7"></i>
					</div>
				</div>

				<draggable class="steps" :list="steps">
					<div class="step"
						:class="{isSelected: currentStepID==id}"
						@click="setStepID(id)"
						v-for="(step, id) in steps">
						<btn icon="trash-o" @click="removeStep(step)"></btn>
						<btn icon="clone" @click="copyStep(step)"></btn>
						<btn icon="sort" class="drag-handle" title="Sort param"></btn>

						<i>Time:</i>
						<input class="digits-3" v-model:value="step.time">

						<i class="bulb-short bulb-statuses" v-for="(light, id) in step.lights">
							<i class="bulb-stat" :style="{color: light.color}">#</i>
						</i>
					</div>
				</draggable>
			</div>
			`
		}
	});

	//Key modifier:
	$(window).on('keydown keyup', function(e) {
		var status = "Save";
		var ctrlOrAlt = ERDS.isMac ? e.altKey : e.ctrlKey;
		switch(true) {
			case ctrlOrAlt && e.shiftKey: status = "Recover"; break;
			case e.shiftKey: status = "Trace"; break;
			case ctrlOrAlt: status = "Clear"; break;
		}

		__VUE.statusSaveButton = status;
		__VUE.statusKeyModifiers =	(e.shiftKey ? __KEYS.SHIFT : 0) |
									(ctrlOrAlt ? __KEYS.CTRL : 0);
									//| (e.altKey ? __KEYS.ALT : 0);
		
		//Handle the dropdown menus:
		if(__VUE.currentDropDown!=null) {
			switch(e.which) {
				case 13:// __VUE.currentDropDown = null; return;
				case 9:// __VUE.currentDropDown = null; return;
				//ESCAPE
				case 27: __VUE.currentDropDown = null; return;
			}
			
			trace(e.which);
		}
	});
	
	$(document).on('click', (e) => {
		if(!__VUE.currentDropDown) return;
		__VUE.currentDropDown = null;
	});

	ERDS.Project = function Project() {};
	
	_.extend(ERDS.Project.prototype, {
		extendVue(vueConfig) {
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
					changeView(id) {
						ERDS.vue.view = id;
						setCookie('view', id);
					},
					
					trace:trace,

					test() {
						trace('test');
					},

					addLight() {
						globalAddLight();
					},

					copyLight(item) {
						this.currentLightItem = duplicateItem(item, __LIGHTS);
						this.currentLightItem.name += " (Copy)";
					},

					removeLight(item) {
						removeItem(item, __LIGHTS, "currentLightItem");
					},

					addAction() {
						globalAddAction();
					},

					copyAction(action) {
						this.currentActionItem = duplicateItem(action, __ACTIONS);
						this.currentActionItem.name += " (Copy)";
					},

					removeAction(item) {
						removeItem(item, __ACTIONS, "currentActionItem");
					},

					addActionParam() {
						globalAddActionParam();
					},

					removeActionParam(param) {
						if(!this.currentActionItem) return;
						this.currentActionItem.params.remove(param);
					},

					copyActionParam(param) {
						if(!this.currentActionItem) return;
						duplicateItem(param, this.currentActionItem.params);
					},

					handleSaveButton(e) {
						if(this.isBusy) return;

						this.isBusy = true;

						switch(e.target.innerHTML) {
							case 'Clear': return this.clearJSON();
							case 'Recover': return this.recoverJSON();
							case 'Trace': this.isBusy = false; return traceJSON();
							default: return this.saveJSON();
						}
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

					createNewSheet() {
						this.currentSheetUpdate(__SHEETS.length);
					},
					
					currentSheetUpdate(id) {
						if(_.isObject(id) && id.target) {
							id = $(id.target).data('index');
						}

						id = parseInt(id);

						trace(this.currentSheetID + " : " + id);

						if(this.currentSheetID===id) return;
						if(id<0 || isNaN(id)) id = 0;
						if(id>=__SHEETS.length) {
							createNewSheetAt(__SHEETS.length, null);
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

						return this.currentSheet = __SHEET;
					},
					
					setCurrentDropDown(item) {
						this.currentDropDown = item;
					},

					selectActionType(actionParam, e) {
						var index = $(e.target).data('index');
						if(isNaN(index) || index >= __ARACOMMANDS.length) return;
						actionParam.type = __ARACOMMANDS[index].name;
					},

					useSuggestedName(light, e, list, prefix) {
						if(!prefix) prefix = "";
						var index = $(e.target).data('index');
						if(isNaN(index) || index >= list.length) return;
						light.name = prefix + list[index].name;
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
			//$$$.

			fadeIn($$$.details, 0.2);

			//If we don't have any hardcoded data, forget the rest!
			if(!checkHardcodedData(projectData)) return;

			if(!projectData || !projectData.json || !projectData.json) {
				$$$.boxError.showBox("Starting with fresh data... :--1:");

				createNewSheetAt(0, null);
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
			trace("NO HARDCODED DATA!")
			$$$.boxError.showBox('Oh no! We don\'t have any hardcoded data! :cry:');
			return false;
		}
		
		__VUE.hardcoded = projectData.hardcoded;
		__ARACOMMANDS = __VUE.hardcoded.AraCommands;

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

			__SHEET = sheet = { name: "Sheet " + (__SHEETS.length+1), definableValues: [], lightSequence: [], actionSequence: [] };
			__DEFS = __SHEET.definableValues;
			__LIGHTS = __SHEET.lightSequence;
			__ACTIONS = __SHEET.actionSequence;

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
			
			globalAddLight();
			globalAddAction();
		}
		
		__SHEETS[id] = sheet;
		
		return sheet;
	}
	
	function globalAddLight() {
		__LIGHTS.push({
			type: 'light-item',
			name: 'Light ' + (__LIGHTS.length+1),

			ringSeqLooping: false,
			ringSeqHoldLast: true,
			ringSteps: [
				{
					type: 'ring-step',
					time: 1,
					audioClip: null,
					//'light-n': {state: 'Full', color: '#f00'},
					//'light-ne': {state: 'Full', color: '#f00'},
					//'light-e': {state: 'Full', color: '#f00'},
					//'light-se': {state: 'Full', color: '#f00'},
					//'light-s': {state: 'Full', color: '#f00'},
					//'light-sw': {state: 'Full', color: '#f00'},
					//'light-w': {state: 'Full', color: '#f00'},
					//'light-nw': {state: 'Full', color: '#f00'},
					lights: [
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
					]
				},
				{
					type: 'ring-step',
					time: 1,
					audioClip: null,
					//'light-n': {state: 'Full', color: '#f00'},
					//'light-ne': {state: 'Full', color: '#f00'},
					//'light-e': {state: 'Full', color: '#f00'},
					//'light-se': {state: 'Full', color: '#f00'},
					//'light-s': {state: 'Full', color: '#f00'},
					//'light-sw': {state: 'Full', color: '#f00'},
					//'light-w': {state: 'Full', color: '#f00'},
					//'light-nw': {state: 'Full', color: '#f00'},
					lights: [
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
					]
				},
				{
					type: 'ring-step',
					time: 1,
					audioClip: null,
					//'light-n': {state: 'Full', color: '#f00'},
					//'light-ne': {state: 'Full', color: '#f00'},
					//'light-e': {state: 'Full', color: '#f00'},
					//'light-se': {state: 'Full', color: '#f00'},
					//'light-s': {state: 'Full', color: '#f00'},
					//'light-sw': {state: 'Full', color: '#f00'},
					//'light-w': {state: 'Full', color: '#f00'},
					//'light-nw': {state: 'Full', color: '#f00'},
					lights: [
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
					]
				},
				{
					type: 'ring-step',
					time: 1,
					audioClip: null,
					//'light-n': {state: 'Full', color: '#f00'},
					//'light-ne': {state: 'Full', color: '#f00'},
					//'light-e': {state: 'Full', color: '#f00'},
					//'light-se': {state: 'Full', color: '#f00'},
					//'light-s': {state: 'Full', color: '#f00'},
					//'light-sw': {state: 'Full', color: '#f00'},
					//'light-w': {state: 'Full', color: '#f00'},
					//'light-nw': {state: 'Full', color: '#f00'},
					lights: [
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'FadeOut', color: '#ff0'},
					]
				}
			],

			stripSeqLooping: false,
			stripSeqHoldLast: false,
			stripSteps: [
				{
					type: 'strip-step',
					time: 1,
					audioClip: null,
					lights: [
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
						{state: 'Full', color: '#f00'},
					]
				}
			],
		});

		__VUE.currentLightItem = __LIGHTS.last();
	}
	
	function globalAddAction() {
		__ACTIONS.push({
			type: 'action-item',
			name: 'Action ' + (__ACTIONS.length+1),
			params: [],
			time: 5
		});
		
		__VUE.currentActionItem = __ACTIONS.last();
		
		globalAddActionParam(); //Always add 1 scripted-action object first
	}
	
	function globalAddActionParam() {
		if(!__VUE.currentActionItem) return;
		
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
		if(item) return list.remove(item);
		if(!__VUE[vueProperty]) return;

		var id = list.remove(__VUE[vueProperty]) - 1;
		__VUE[vueProperty] = id<0 ? list.first() : list[id];
	}

	function duplicateItem(item, list) {
		var id = list.indexOf(item);
		var dup = _.jsonClone(item);
		list.splice(id+1, 0, dup);
		return dup;
	}
	
})(ERDS);

