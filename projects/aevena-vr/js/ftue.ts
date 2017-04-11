/**
 * Created by Chamberlain on 10/04/2017.
 */
declare var window;
var __STEPS;

(function(ERDS) {
    $$$.on('vue-extend', function() {
        var vueData = ERDS.vueConfig.data;
        var vueComputed = ERDS.vueConfig.computed;
        var vueMethods = ERDS.vueConfig.methods;

        _.extend(vueData, {
            ftue_currentStep: null

        });

        _.extend(vueComputed, {
            ftue_lightNames() {
                return [{name: 'Default'}].concat(__SHEET.lightSequence);
            },

            ftue_actionNames() {
                return [{name: 'Default'}].concat(__SHEET.actionSequence);
            }
        });

        _.extend(vueMethods, {

            ftue_invalidate() {
                this.ftue_validateSteps();
            },

            ftue_validateSteps() {
                ERDS.isDataValid = true;

                if(!__STEPS || !__STEPS.length) {
                    return __VUE.$forceUpdate();
                }

                var stepNames = [];

                __STEPS.forEach(step => {
                    var lowName = step.name.toLowerCase().trim();
                    if(stepNames.has(lowName)) {
                        step.isNameDuplicate = true;
                        ERDS.isDataValid = false;
                        return;
                    }

                    step.isNameDuplicate = false;

                    stepNames.push(lowName);
                });

                __VUE.$forceUpdate();
            },

            ftue_removeStep(step) {
                __STEPS.remove(step);

                this.ftue_validateSteps();
            },

            ftue_addStep() {
                __STEPS.push({
                    name: 'STEP_NAME',
                    audioClipName: '',
                    audioVolume: 1.0,
                    lightSequence: 'Default',
                    actionName: 'Default',
                    webPanel: '',
                    triggerName: '',
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

            ftue_isActionSelected(item) {
                return this.ftue_currentStep.actionName==item.name;
            },

            ftue_setCurrentActionSeq(e, step) {
                if(!step) return;
                step.actionName = e.name;
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
})(ERDS);