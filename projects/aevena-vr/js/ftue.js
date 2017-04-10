/**
 * Created by Chamberlain on 10/04/2017.
 */
var __STEPS;
(function (ERDS) {
    var win = $(window);
    win.on('vue-extend', function () {
        var vueData = ERDS.vueConfig.data;
        var vueComputed = ERDS.vueConfig.computed;
        var vueMethods = ERDS.vueConfig.methods;
        _.extend(vueData, {
            ftue_currentStep: null
        });
        _.extend(vueComputed, {
            ftue_lightNames: function () {
                return [{ name: 'Default' }].concat(__SHEET.lightSequence);
            },
            ftue_actionNames: function () {
                return [{ name: 'Default' }].concat(__SHEET.actionSequence);
            }
        });
        _.extend(vueMethods, {
            ftue_invalidate: function () {
                this.ftue_validateSteps();
            },
            ftue_validateSteps: function () {
                var stepNames = [];
                ERDS.isDataValid = true;
                __STEPS.forEach(function (step) {
                    var lowName = step.name.toLowerCase().trim();
                    if (stepNames.has(lowName)) {
                        trace("DUP!!!!");
                        step.isNameDuplicate = true;
                        ERDS.isDataValid = false;
                        return;
                    }
                    step.isNameDuplicate = false;
                    stepNames.push(lowName);
                });
                trace("stepNames: " + stepNames);
                __VUE.$forceUpdate();
            },
            ftue_removeStep: function (step) {
                __STEPS.remove(step);
                __VUE.$forceUpdate();
            },
            ftue_addStep: function () {
                trace("Adding a step.");
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
                __VUE.$forceUpdate();
            },
            ftue_isLightSelected: function (item) {
                return this.ftue_currentStep.lightSequence == item.name;
            },
            ftue_setCurrentLightSeq: function (e, step) {
                if (!step)
                    return;
                step.lightSequence = e.name;
            },
            ftue_isActionSelected: function (item) {
                return this.ftue_currentStep.actionName == item.name;
            },
            ftue_setCurrentActionSeq: function (e, step) {
                if (!step)
                    return;
                step.actionName = e.name;
            }
        });
    });
    win.on('vue-validate', function () {
        if (!__SHEET.ftueSequence)
            __SHEET.ftueSequence = { steps: [] };
        if (!__SHEET.ftueSequence.steps)
            __SHEET.ftueSequence.steps = [];
        __STEPS = __SHEET.ftueSequence.steps;
        trace("VALIDATING FTUE!");
        if (__STEPS.length > 0) {
            __VUE.ftue_currentStep = __STEPS[0];
        }
    });
    win.on('vue-ready', function () {
        trace("vue-ready: FTUE");
    });
})(ERDS);
