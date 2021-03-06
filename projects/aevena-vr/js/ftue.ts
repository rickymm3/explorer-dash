/**
 * Created by Chamberlain on 10/04/2017.
 */
declare var window;
var __STEPS;

(function($$$) {
    $$$.on('vue-extend', function() {
        var vueData = $$$.vueConfig.data;
        var vueComputed = $$$.vueConfig.computed;
        var vueMethods = $$$.vueConfig.methods;

        _.extend(vueData, {
            ftue_currentStep: null
        });

        _.extend(vueComputed, {
            ftue_lightNames() {
                return [{name: 'none'}].concat(__SHEET.lightSequence);
            },

            ftue_actionNames() {
                return [{name: 'none'}].concat(__SHEET.actionSequence);
            },

            ftue_webPanels() {
                return [{name: 'none'}].concat(this._webPanels);
            },

            ftue_triggerNames() {
                return [{name: 'none'}].concat(this._triggerNames);
            },

            ftue_nextStepRefNames() {
                return [{name: 'none'}, {name: 'COMPLETE_LAUNCH_APP'}].concat(__SHEET.ftueSequence.steps);
            },

            _webPanels() {
                return __VUE.hardcoded.WebPanels || [];
            },

            _triggerNames() {
                return __VUE.hardcoded.TriggerNames || [];
            }
        });

        _.extend(vueMethods, {

            ftue_invalidate() {
                this.ftue_validateSteps();
            },

            ftue_validateSteps() {
                $$$.isDataValid = true;

                if(!__STEPS || !__STEPS.length) {
                    return __VUE.$forceUpdate();
                }

                var stepNames = [];

                __STEPS.forEach(step => {
                    function applyDefaultsIfNull(prop, def) {
                        if(_.isArray(def)) def = def[0].name;
                        if(!step[prop] || !step[prop].trim().length) {
                            step[prop] = def;
                        }
                    }

                    applyDefaultsIfNull('lightSequence', this.ftue_lightNames);
                    applyDefaultsIfNull('actionName', this.ftue_actionNames);
                    applyDefaultsIfNull('nextStepReference', this.ftue_nextStepRefNames);
                    applyDefaultsIfNull('webPanel', this.ftue_webPanels);
                    applyDefaultsIfNull('triggerName', this.ftue_triggerNames);

                    var lowName = step.name.toLowerCase().trim();
                    if(stepNames.has(lowName)) {
                        step.isNameDuplicate = true;
                        $$$.isDataValid = false;
                        return;
                    }

                    step.isNameDuplicate = false;

                    stepNames.push(lowName);
                });

                __VUE.$forceUpdate();
            },

            ftue_cloneStep(step) {
                var dup = duplicateItem(step, __STEPS);
                dup.name += " Copy";
                this.ftue_invalidate();
            },

            ftue_removeStep(step) {
                __STEPS.remove(step);

                this.ftue_validateSteps();
            },

            ftue_addStep() {
                function getFirst(arr) {
                    return arr[0].name;
                }

                __STEPS.push({
                    name: 'STEP_NAME ' + __STEPS.length,
                    audioClipName: '',
                    audioVolume: 1.0,
                    lightSequence:  getFirst(this.ftue_lightNames),
                    actionName: getFirst(this.ftue_actionNames),
                    webPanel: getFirst(this.ftue_webPanels),
                    triggerName: getFirst(this.ftue_triggerNames),
                    nextStepReference: getFirst(this.ftue_nextStepRefNames),
                    stepDuration: '',
                    actionDelay: 0
                });

                this.ftue_validateSteps();
            },

            ftue_isLightSelected(item) {
                return this.ftue_currentStep.lightSequence==item.name;
            },

            ftue_setCurrentLightSeq(e, step) {
                if(!step) return;
                step.lightSequence = e.name;
            },

            ////////////////////////////////

            ftue_isActionSelected(item) {
                return this.ftue_currentStep.actionName==item.name;
            },

            ftue_setCurrentActionSeq(e, step) {
                if(!step) return;
                step.actionName = e.name;
            },

            ////////////////////////////////

            ftue_isNextStepRefSelected(item) {
                return this.ftue_currentStep.nextStepReference==item.name;
            },

            ftue_setCurrentNextStepRef(e, step) {
                if(!step) return;
                step.nextStepReference = e.name;
            },

            ftue_isWebPanelSelected(item) {
                return this.ftue_currentStep.webPanel==item.name;
            },

            ftue_setCurrentWebPanel(e, step) {
                if(!step) return;
                step.webPanel = e.name;
            },

            ftue_isTriggerNameSelected(item) {
                return this.ftue_currentStep.triggerName==item.name;
            },

            ftue_setCurrentTriggerName(e, step) {
                if(!step) return;
                step.triggerName = e.name;
            },
        })

    });

    $$$.on('vue-validate', function() {
        if(!__SHEET.ftueSequence) __SHEET.ftueSequence = {steps:[]};
        if(!__SHEET.ftueSequence.steps) __SHEET.ftueSequence.steps = [];

        __STEPS = __SHEET.ftueSequence.steps;

        trace("VALIDATING FTUE!");

        if(__STEPS.length>0) {
            __VUE.ftue_currentStep = __STEPS[0];
        }

        __VUE.ftue_invalidate();
    });


    $$$.on('vue-ready', function() {
        trace("vue-ready: FTUE");
    });
})($$$);