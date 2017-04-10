/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />

declare var ERDS, _, $, $$$, Vue, TweenMax, TimelineMax,
	trace, traceError, traceClear, toIcon, window, document, prompt;

var __VUE, __SHEETS, __SHEET, __DEFS, __LIGHTS, __ACTIONS, __ARACOMMANDS, __COLORS;
var __JSONDATA, __KEYS = {SHIFT: 1, CTRL: 2, ALT: 4};

function traceJSON(obj=null) {
	var result = JSON.stringify(obj || __JSONDATA, null, ' ');
	trace(result);

	$$$.boxInfo.showBox(result);
	return result;
}

function showPopup(header, message, options) {
	if(!options) options = {};
	options = _.assign(options, {header: header, message: message});

	if(!options.dismiss) {
		options.dismiss = {ok:true,cancel:true};
		if(options.ok) options.dismiss.ok = options.ok;
		if(options.cancel) options.dismiss.cancel = options.cancel;
	}
	__VUE.popup = options;
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
				`<div class="numeric-prop">
					<div class="col-1">
						<i v-html="obj.name.camelToTitleCase()"></i>:
					</div>
					<div class="col-2">
						<input type="text" v-model:value="obj.value" />
					</div>
				</div>`
		},

		'light-item': {
			props: ['obj'],
			methods: {
				showPanel() {
					__VUE.currentLightItem = this.obj;
					setCookie('light', __LIGHTS.indexOf(this.obj));
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
				`<div class="item light-item" :class="isSelected">
					<btn :label="obj.name" v-on:click="showPanel()" />
					<slot></slot>
				</div>`
		},

		'action-item': {
			props: ['obj'],
			methods: {
				showPanel() {
					__VUE.currentActionItem = this.obj;
					setCookie('action', __ACTIONS.indexOf(this.obj));
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
				`<div class="item action-item" :class="isSelected">
					<btn :label="obj.name" v-on:click="showPanel()"></btn><slot></slot>
				</div>`
		},

		'btn': {
			props: ['obj', 'label', 'emoji', 'icon'],
			methods: { click(e) { this.$emit('click', e); } },
			template:
				`<div class="btn" v-on:click.capture.stop.prevent="click">
					<i v-if="emoji" :class="\'v-align-mid em em-\'+emoji" aria-hidden="true"></i>
					<i v-if="icon" :class="\'v-align-mid icon fa fa-\'+icon" aria-hidden="true"></i>
					<i v-html="label"></i>
				</div>`
		},

		'dropdown': {
			props: {
				list: Array,
				label: { type: String, default: '' },
				icon: { default: "caret-down" },
				is_selected: { type: Function, default() { return false; } },
				dropdown_source: [Object,Array],
				class_dropdown: { type: String, default: "default-dropdown" },
				class_btn: { type: String, default: "default-btn" }
			},
			computed: {
				currentDropDown() { return __VUE ? __VUE.currentDropDown : null; }
			},
			methods: {
				isSelected(item) {
					return this.is_selected && this.is_selected(item);
				},
				onButtonClick(e) {
					__VUE.setCurrentDropDown(this.dropdown_source);
					this.$emit('dropdown', e);
				},
				onSelectionClick(e) {
					this.$emit('click', e);
					var id = parseInt($(e.target).data('index'));
					id = isNaN(id) ? -1 : id;
					if(id==-1) return;
					this.$emit('selected', this.list[id] );
				}
			},
			template: //!!!
				`<span class="dropdown">
					<btn class="padded-5"
						 :class="class_btn"
						 @click="onButtonClick($event)"
						 :icon="icon"
						 :label="label">
					</btn>
					<div :class="class_dropdown"
						class="dropdown-list"
						 v-if="currentDropDown==dropdown_source"
						 @click="onSelectionClick($event)">
						<div v-for="(item, id) in list"
							v-html="item.name"
							:class="{isSelected: is_selected(item)}"
							:data-index="id"></div>
					</div>
				</span>`
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
					'currentColor': '#fff',
					'currentStepID': 0,
					'currentFocus': 'Colors',
					'isMouseDown': false
				};
			},

			computed: {
				currentStepName() {
					return 'current'+this.prefix+'Step';
				},

				currentStep() {
					if(this.steps.length==0) return null;
					if(this.currentStepID<0 || this.currentStepID>=this.steps.length) {
						this.currentStepID = 0;
						//return null;
					}
					return this.steps[this.currentStepID];
				},

				isFocusColors() {
					return this.currentFocus=="Colors";
				},

				currentDropDown() {
					return __VUE.currentDropDown;
				},

				colors() {
					return __COLORS;
				},

				modes() {
					return __VUE.hardcoded.LightStates;
				},

				audioClips() {
					return __VUE.hardcoded.AudioClips;
				},
			},

			methods: {

				addStep() {
					this.steps.push( globalAddLightStep() );
					this.currentStepID = this.steps.length-1;
				},

				copyStep(item) {
					var newItem = duplicateItem(item, this.steps);
					this.currentStepID = this.steps.indexOf(newItem);
					//this.currentLightItem.name += " (Copy)";
				},

				removeStep(item) {
					removeItem(item, this.steps, this.currentStepName);
				},

				setCurrentDropDown(item) {
					__VUE.currentDropDown = item;
				},

				convertStateToChar(light) {
					switch(light.state) {
						case "Colors": return "!";
						case "Off": return toIcon(":battery-0:");
						case "Full": return toIcon(":battery-full:");
						case "Half": return toIcon(":battery-2:");
						case "Quarter": return toIcon(":battery-1:");
						case "FadeOn": return "&#x25E2;";
						case "FadeOff": return "&#x25E3;";
					}
				},

				setCurrentFocus(e) {
					if(!this.currentStep) return;
					this.currentFocus = e.name;
				},

				setCurrentAudio(e) {
					if(!this.currentStep) return;
					this.currentStep.audioClipName = e.name;

					this.playSFX();
				},

				playSFX(step) {
					if(!step) step = this.currentStep;
					var sfxID = ERDS.audiosprite.play(step.audioClipName);
					ERDS.audiosprite.volume(step.audioVolume, sfxID);
				},

				isAudioSelected(item) {
					return this.currentStep.audioClipName==item.name;
				},

				isCurrentMode(item) {
					return this.currentFocus == item.name;
				},

				showDecimals(num) {
					return parseFloat(num).toFixed(1);
				},

				setNav() {
					var _this = this;
					if(__VUE.nav!=_this) {
						__VUE.selectedSteps = null;
						//__VUE.copiedSteps = null;
						if(__VUE.nav) __VUE.nav.$forceUpdate();
						__VUE.nav = _this;
					}

					trace("NAV is: " + this.header);
					_this.isMouseDown = true;
					$(window).one('mouseup', function() {
						trace("Mouse is up now");
						_this.isMouseDown = false;
					})
				},

				onClickBulb(light) {
					if(this.isFocusColors) {
						light.color = this.currentColor;
						this.$forceUpdate();
						return;
					}

					light.state = this.currentFocus;
					this.$forceUpdate();
				},

				onHoverBulb(light) {
					var id = this.currentStep.lights.indexOf(light);
					trace("Hovering on " + id);
					if(!this.isMouseDown) return;
					this.onClickBulb(light);
				},

				applyAll() {
					var t = this;
					if(!t.currentStep || !t.currentStep.lights) return;
					t.currentStep.lights.forEach(light => t.onClickBulb(light));
				},

				setStepID(e, id) {
					if(__VUE.statusKeyModifiers>0) {
						if(!__VUE.selectedSteps || !__VUE.selectedSteps.length) {
							__VUE.selectedSteps = [];
						}

						__VUE.copiedSteps = null;
						__VUE.selectedSteps.push( this.steps[id] );
						this.$forceUpdate();
						return;
					}

					__VUE.selectedSteps = null;

					this.currentStepID = id;
					this.playSFX();
					//__VUE[this.currentStepName] = this.steps[id];
				},

				isMultiSelected(step) {
					return !__VUE.selectedSteps ? false : __VUE.selectedSteps.has(step);
				},

				isCopied(step) {
					return !__VUE.copiedSteps ? false : __VUE.copiedSteps.has(step);
				},

				onCopy(e) {
					if(!__VUE.selectedSteps || !__VUE.selectedSteps.length) {
						if(!this.currentStep) return;
						__VUE.selectedSteps = [this.currentStep];
					}

					__VUE.copiedSteps = __VUE.selectedSteps;
					this.$forceUpdate();

				},

				onPaste(e) {
					if(!__VUE.copiedSteps || !__VUE.copiedSteps.length || !this.currentStep) return;

					var id = this.steps.indexOf(this.currentStep);
					var items = _.jsonClone(__VUE.copiedSteps);


					var before = this.steps.length;
					this.steps.insert(id + 1, items);
					trace("Steps: before: " + before + " : " + this.steps.length);

					this.$forceUpdate();
					//__VUE.$forceUpdate();
				},

				goUp(e) {
					stopEvent(e);

					if(this.currentStepID<=0) return;
					this.currentStepID--;
				},

				goDown(e) {
					stopEvent(e);

					if(this.currentStepID>=(this.steps.length-1)) return;
					this.currentStepID++;
				},

				goLeft(e) {
					stopEvent(e);
					this.rotateLeft();
				},

				goRight(e) {
					stopEvent(e);
					this.rotateRight();
				},

				rotateLeft() {
					var step = this.currentStep;
					step.lights = step.lights.concat().rotate(1);
				},

				rotateRight() {
					var step = this.currentStep;
					step.lights = step.lights.concat().rotate(-1);
				},

				playSequence(e) {
					stopEvent(e);

					if(this._tween) {
						this._tween.kill();
						this._tween = null;
					}

					var _this = this;
					var twn = this._tween = new TimelineMax();
					var len = this.steps.length;
					var bulbs = this.$refs.lights;

					this.$el.classList.add('hide-icons');
					twn.addLabel('start');

					bulbs.forEach(bulb => {
						twn.to(bulb, 0.2, {scale: 0.5, alpha: 0}, 'start');
						twn.set(bulb, {scale:1.0});
					});

					twn.wait(0.2);

					for(var s=0; s<len; s++) {
						var step = this.steps[s];
						var label = 'step'+s;
						var lights = step.lights;

						twn.addLabel(label);
						twn.set(_this, {currentStepID: s});
						for(var i=0; i<lights.length; i++) {
							var light = lights[i];
							var bulb = bulbs[i];
							var twnTo:any = {};
							var state = light.state.toLowerCase();
							var doNow = false;

							switch(state) {
								case 'fadeon': twnTo.alpha = 1.0; break;
								case 'fadeoff': twnTo.alpha = 0.0; break;
								case 'fadehalf': twnTo.alpha = 0.5; break;
								case 'quarter': twnTo.alpha = 0.25; doNow=true; break;
								case 'half': twnTo.alpha = 0.5; doNow=true; break;
								case 'full': twnTo.alpha = 1.0; doNow=true; break;
								case 'off': twnTo.alpha = 0.0; doNow=true; break;
							}

							if(doNow) twn.set(bulb, twnTo, label);
							else twn.to(bulb, parseFloat(step.time), twnTo, label);
						}

						twn.wait(step.time, label);
					}

					twn.wait(0.5);

					twn.call(function() {
						_this.currentStepID = 0;
						_this.$el.classList.remove('hide-icons');
					});

					twn.addLabel('end');
					bulbs.forEach(bulb => {
						twn.set(bulb, {scale:0.5}, 'end');
						twn.to(bulb, 0.2, {scale: 1.0, alpha: 1}, 'end');
					});


					twn.play();
				}
			},

			template: `
			<div class="padded-3 subpanel" @mousedown.capture="setNav()">
				<i class="subheader nowrap v-align-mid-kids">
					<i v-html="header"></i>
			
					<i class="spacer-1">
						<input type="checkbox" value="loops" v-model="obj[loops]"> &nbsp;
						<i class="fa fa-refresh v-align-mid" title="Looping"></i>
					</i>
			
					<i class="spacer-1">
						<input type="checkbox" value="holds" v-model="obj[holds]"> &nbsp;
						<i class="fa fa-pause v-align-mid" title="Hold Last"></i>
					</i>
			
					<i class="break">
						<btn class="" icon="plus-square" label="Step" @click="addStep"></btn>
						<btn class="" icon="play" @click="playSequence($event)"></btn>
					</i>
				</i>
			
				<br/>
			
				<div class="light-comp missing bg-disabled" v-if="!currentStep" :class="class_lightcomp">
					No Sequence Data Found!
				</div>
			
				<div class="light-comp" v-if="currentStep" :class="class_lightcomp">
					<i class="nowrap">
						<btn class="padded-5" label="Apply All" @click="applyAll"></btn>
			
						<dropdown	class_btn="color-names"
									 class_dropdown="step-modes"
									 icon="paint-brush"
									 :list="modes"
									 :dropdown_source="currentStep"
									 :is_selected="isCurrentMode"
									 @selected="setCurrentFocus($event)">
						</dropdown>
			
						<i class="padded-5">
							<i v-if="isFocusColors">
								<i>Color:</i>
								
								<input class="color-picker" v-model="currentColor" 
									:style="{backgroundColor: currentColor}">
								
								<div class="color-cells">
									<i v-for="(clr, id) in colors" ref="colorpallette">
										<span @click="currentColor = clr.name" class="cell" :style="{backgroundColor: clr.name}">
									    </span>
										<br v-if="(id == 5)" />
									</i>
									
									   
								</div>
							</i>
							
							<i v-if="!isFocusColors">Painting: "{{currentFocus}}"</i>
						</i>
					</i>
			
					<br/>
			
					<dropdown	class_btn="audio"
								 class_dropdown="audio-list"
								 icon="volume-up"
								 :list="audioClips"
								 :dropdown_source="steps"
								 :is_selected="isAudioSelected"
								 @selected="setCurrentAudio($event)">
					</dropdown>
			
					<i v-if="currentStep.audioClipName!='Off'">
						<input class="padded-2 audio-name" v-model:value="currentStep.audioClipName"
							   @click="playSFX()" @change="playSFX()"/>
			
						<i class="nowrap">
							<i>Volume</i>
							<input class="digits-2" v-model:value="currentStep.audioVolume"
								   @click="playSFX()" @change="playSFX()">
						</i>
					</i>
			
			
			
					<!-- Draw Actual Component -->
					<div class="center">
						<i v-for="(light, id) in currentStep.lights" ref="lights"
						   :class="['bulb', 'bulb-'+id, 'bulb-'+light.state.toLowerCase()]"
						   :style="{backgroundColor: light.color}"
						   @mouseover="onHoverBulb(light)"
						   @mousedown="onClickBulb(light)">
						</i>
					</div>
			
					<i class="bottom-bar">
						<btn icon="rotate-left" @click="rotateLeft()" title="rotates LEDs left"></btn>
						<btn icon="rotate-right" @click="rotateRight()" title="rotates LEDs right"></btn>
			
					</i>
				</div>
			
				<div v-if="!currentStep" class="steps padded-3 v-align-mid shadowy">
					<i class="padded-5 inline-block"><b>Add a Light Sequence Step:</b></i>
					<btn class="v-align-mid" icon="plus-square" label="Step" @click="addStep"></btn>
				</div>
			
				<draggable v-if="currentStep" class="steps" :list="steps" :options="{ handle: '.drag-handle' }">
					<div class="step"
						 :class="{isSelected: currentStepID==id, isMulti: isMultiSelected(step), isCopied: isCopied(step)}"
						 @click="setStepID($event, id)"
						 v-for="(step, id) in steps">
						<btn icon="trash-o" @click="removeStep(step)"></btn>
						<btn icon="clone" @click="copyStep(step)"></btn>
						<btn icon="sort" class="drag-handle" title="Sort param"></btn>
			
						<i class="bulb-short bulb-statuses" v-for="(light, id) in step.lights">
							<i class="bulb-stat"
							   :style="{color: light.color}"
							   v-html="convertStateToChar(light)">
							</i>
						</i>
			
						<i class="nowrap">
							<i class="fa fa-clock-o"></i>
							<input class="digits-4" v-model:value="step.time">
						</i>
			
			
						<i v-if="step.audioClipName!='Off'" :title="step.audioClipName" class=nowrap>
							<i class="fa fa-volume-up"></i>
							<input class="digits-2" v-model:value="step.audioVolume">
						</i>
					</div>
				</draggable>
			</div>`
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

		if(e.type=="keyup") return;

		var isEnter = false, isTab = false, isEscape = false;
		var ARROW_UP = 38, ARROW_DOWN = 40, ARROW_LEFT = 37, ARROW_RIGHT = 39;

		function tryFunc(name, e) {
			if(!__VUE.nav || !__VUE.nav[name]) return null;
			return __VUE.nav[name](e);
		}

		switch(e.which) {
			case 27: isEscape = true; break;
			case 13: isEnter = true; break;
			case 9: isTab = true; break;
			case 67: if(ctrlOrAlt) return tryFunc('onCopy', e); break;
			case 86: if(ctrlOrAlt) return tryFunc('onPaste', e); break;
			case ARROW_UP: return tryFunc('goUp',e);
			case ARROW_DOWN: return tryFunc('goDown',e);
			case ARROW_LEFT: return tryFunc('goLeft',e);
			case ARROW_RIGHT: return tryFunc('goRight',e);
			default: if(__VUE.lastKeyPressed!=e.which) {
					__VUE.lastKeyPressed = e.which;
					trace(e.which);
				}
				return;
		}

		__VUE.lastKeyPressed = e.which;

		//Handle the dropdown menus:
		if(__VUE.currentDropDown!=null && isEscape) {
			return __VUE.currentDropDown = null;
		}

		if(__VUE.popup!=null) {
			if(isEscape) return __VUE.popup = null;
			if(isEnter) {
				__VUE.popup.onEnter && __VUE.popup.onEnter();
				return __VUE.popup = null;
			}
		}
	});

	if(ERDS.ftue) {
		ERDS.ftue.init();
	}
	
	$(document).on('click', (e) => {
		if(!__VUE.currentDropDown) return;
		__VUE.currentDropDown = null;
	});

	ERDS.Project = function Project() {};
	
	_.extend(ERDS.Project.prototype, {
		extendVue() {
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
					forceWideView: getCookie('forceWideView')=='true',
					popup: null, /*{
						header: "Header Test",
						message: "Testing message",
						checkboxes: [{name:"test"},{name:"one"},{name:"two"}],
						dismiss: {ok:true, cancel:true}
					},*/
					hardcoded: {},
					jsonData: {
						currentSheetName: '',
						sheets: []
					}
				},

				computed: {
					modes() {
						return __VUE.hardcoded.LightStates;
					},

					audioClips() {
						return __VUE.hardcoded.AudioClips;
					},
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
						trace("remove light...");
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

						if(!ERDS.isDataValid) {
							$$$.boxError.showBox('Fix any data issues first before saving');
							return;
						}
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

					addSheet() {
						createNewSheetAt(__SHEETS.length, null);
						this.currentSheetUpdate(__SHEETS.length-1);
					},

					renameSheet() {
						var response = prompt("Rename the sheet to...", this.currentSheet.name);
						this.currentSheet.name = response;
					},

					copySheet() {
						var sheet = createNewSheetAt(__SHEETS.length, this.currentSheet);
						sheet.name += " Copy";
						this.currentSheetUpdate(__SHEETS.length-1);
					},

					removeSheet() {
						if(!this.currentSheet || this.currentSheetID<0) return;
						var id = this.jsonData.sheets.remove(this.currentSheet);
						this.currentSheetID = -1;
						this.currentSheetUpdate(id-1);
					},

					exportSheetsPopup() {
						showPopup("Export Sheet(s)", "Select the sheets you would like to export:", {
							checkboxes: __SHEETS.map((sheet, id) => {return {name:sheet.name, id: id}}),
							ok(options) {
								//Filter out the uneeded sheets:
								var mySheetIDs = options.checkboxes
									.filter(sheet => sheet.value)
									.map(sheet => sheet.name);

								var mySheets = _.jsonClone(__SHEETS)
									.filter(sheet => mySheetIDs.has(sheet.name));

								//Now do a client-side file download:
								downloadJSON({sheets: mySheets}, ERDS.projectName + ".json");
							}
						});
					},

					isSheetSelected(sheet) {
						trace(sheet);
						return true;
					},
					
					currentSheetUpdate(id) {
						if(_.isObject(id)) {
							id = $(id.target).data('index');
						}

						id = parseInt(id);

						trace(this.currentSheetID + " : " + id);

						setCookie('sheet', id);

						if(this.currentSheetID===id) return;
						if(id<0 || isNaN(id) || id>=__SHEETS.length) id = 0;
						if(!__SHEETS.length) {
							trace("sheet is null!");
							this.currentSheet = null;
							return;
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
						__JSONDATA.currentSheetName = __SHEET.name;

						//Try to preserve the selection index:
						this.currentActionItem = trySameIndex(__ACTIONS, old.__ACTIONS, this.currentActionItem);
						this.currentLightItem = trySameIndex(__LIGHTS, old.__LIGHTS, this.currentLightItem);

						$(window).trigger('vue-validate');

						return this.currentSheet = __SHEET;
					},
					
					setCurrentDropDown(item) {
						this.currentDropDown = item;
					},

					selectActionType(actionParam, e) {
						actionParam.type = e.name;
					},

					useSuggestedName(light, e, list, prefix) {
						if(!prefix) prefix = "";
						light.name = prefix + e.name;
					},

					showPopup(header, message, options) {
						showPopup(header, message, options);
					},

					onPopupDismiss(buttonName) {
						var popup = this.popup;
						var btn = popup.dismiss[buttonName];
						this.popup = null;

						if(btn==null) return;

						if(_.isFunction(btn)) btn(popup);
					},

					onForceWideView() {
						setCookie('forceWideView', this.forceWideView);
					},

					playAll(e) {
						stopEvent(e);
						this.$refs.stripLight.playSequence();
						this.$refs.ringLight.playSequence();
					}
				}
			};
		},

		init(projectData) {
			__VUE = ERDS.vue;
			__JSONDATA = __VUE.jsonData;
			__SHEETS = __JSONDATA.sheets;

			$(window).trigger("vue-ready");

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
				_.jsonFixBooleans(projectData.json);
				__JSONDATA = __VUE.jsonData = projectData.json;
				__SHEETS = __JSONDATA.sheets;
			}
			
			__VUE.currentSheetUpdate(getCookie('sheet', 0));
			if(this.currentSheet) {
				__VUE.currentLightItem = __LIGHTS[getCookie('light', 0)];
				__VUE.currentActionItem = __ACTIONS[getCookie('action', 0)];
			}

			//Force-Reset the 'isBusy' status when an error occurs:
			ERDS.io.on("server-error", function() { __VUE.isBusy = false; });
			ERDS.io.on('isBusy', function(status) {
				__VUE.isBusy = status;
			});

			ERDS.__media = ERDS.projectName + '/media/';

			$.ajax({
				url: ERDS.__media + 'audiosprite.json',
				success(json) {
					if(!json) return;
					json.src = json.src.map(file => ERDS.__media + file);
					ERDS.audiosprite = new Howl(json);
				},
				error(err) {
					$$$.boxError.showBox("Failed to load AudioSprite! :cry: :mute:");
				}
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
			trace("NO HARDCODED DATA!");
			$$$.boxError.showBox('Oh no! We don\'t have any hardcoded data! :cry:');
			return false;
		}
		
		__VUE.hardcoded = projectData.hardcoded;
		__ARACOMMANDS = __VUE.hardcoded.AraCommands;
		__COLORS = __VUE.hardcoded.Colors;

		return true;
	}
	
	function createNewSheetAt(id, duplicate) {
		if(id==null) id = __JSONDATA.sheets.length;

		var sheet;

		trace("NEW DATA...");
		
		if(duplicate) {
			$$$.boxInfo.showBox("Duplicating Sheet...");
			
			//Do a quick JSON -to-and-from- to deep clone all the data without the Vue garbage around it.
			sheet = _.jsonClone(duplicate);
		} else {
			$$$.boxInfo.showBox("Creating New Sheet...");

			__SHEET = sheet = {
				name: "Sheet " + (__SHEETS.length+1),
				definableValues: [],
				lightSequence: [],
				actionSequence: []
			};

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
				{type: 'numeric-prop', name: 'mainUIPanelDistance', value: 1},
				{type: 'numeric-prop', name: 'baseMass', value: 1},
				{type: 'numeric-prop', name: 'swingDampening', value: 1}
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
			ringSeqHoldLast: false,
			ringSteps: [
				globalAddLightStep()
			],

			stripSeqLooping: false,
			stripSeqHoldLast: false,
			stripSteps: [
				globalAddLightStep()
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

	function globalAddLightStep() {
		return {
			type: 'light-step',
			time: 1,
			audioClipName: "Off",
			audioVolume: 1.0,
			lights: [
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
				{state: 'Full', color: '#fff'},
			]
		}
	}

	function removeItem(item, list, vueProperty) {
		if(item) return list.remove(item);
		if(!__VUE[vueProperty]) {
			traceError(vueProperty + " contains nothing!");
			return;
		}

		var id = list.remove(__VUE[vueProperty]) - 1;
		__VUE[vueProperty] = id<0 ? (list.length > 0 ? list.first() : null) : list[id];
	}

	function duplicateItem(item, list) {
		var id = list.indexOf(item);
		var dup = _.jsonClone(item);
		list.splice(id+1, 0, dup);
		return dup;
	}

	function stopEvent(e) {
		if(!e) return;
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
	}
	
})(ERDS);

