var __STEPS;
(function (ERDS) {
    $$$.on('vue-extend', function () {
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
            },
            ftue_webPanels: function () {
                return [{ name: 'none' }].concat(__VUE.hardcoded.WebPanels);
            },
            ftue_triggerNames: function () {
                return [{ name: 'none' }].concat(__VUE.hardcoded.TriggerNames);
            },
            ftue_nextStepRefNames: function () {
                return [{ name: 'none' }].concat(__STEPS);
            }
        });
        _.extend(vueMethods, {
            ftue_invalidate: function () {
                this.ftue_validateSteps();
            },
            ftue_validateSteps: function () {
                var _this = this;
                ERDS.isDataValid = true;
                if (!__STEPS || !__STEPS.length) {
                    return __VUE.$forceUpdate();
                }
                var stepNames = [];
                __STEPS.forEach(function (step) {
                    function applyDefaultsIfNull(prop, def) {
                        if (_.isArray(def))
                            def = def[0].name;
                        if (!step[prop] || !step[prop].trim().length) {
                            step[prop] = def;
                        }
                    }
                    applyDefaultsIfNull('lightSequence', _this.ftue_lightNames);
                    applyDefaultsIfNull('actionName', _this.ftue_actionNames);
                    applyDefaultsIfNull('nextStepReference', _this.ftue_nextStepRefNames);
                    applyDefaultsIfNull('webPanel', _this.ftue_webPanels);
                    applyDefaultsIfNull('triggerName', _this.ftue_triggerNames);
                    var lowName = step.name.toLowerCase().trim();
                    if (stepNames.has(lowName)) {
                        step.isNameDuplicate = true;
                        ERDS.isDataValid = false;
                        return;
                    }
                    step.isNameDuplicate = false;
                    stepNames.push(lowName);
                });
                __VUE.$forceUpdate();
            },
            ftue_removeStep: function (step) {
                __STEPS.remove(step);
                this.ftue_validateSteps();
            },
            ftue_addStep: function () {
                __STEPS.push({
                    name: 'STEP_NAME ' + __STEPS.length,
                    audioClipName: '',
                    audioVolume: 1.0,
                    lightSequence: this.ftue_lightNames[0].name,
                    actionName: this.ftue_actionNames[0].name,
                    webPanel: this.ftue_webPanels[0].name,
                    triggerName: this.ftue_triggerNames[0].name,
                    nextStepReference: this.ftue_nextStepRefNames[0].name,
                    stepDuration: '',
                    actionDelay: 0
                });
                this.ftue_validateSteps();
            },
            ftue_isLightSelected: function (item) {
                return this.ftue_currentStep.lightSequence == item.name;
            },
            ftue_setCurrentLightSeq: function (e, step) {
                if (!step)
                    return;
                step.lightSequence = e.name;
            },
            ////////////////////////////////
            ftue_isActionSelected: function (item) {
                return this.ftue_currentStep.actionName == item.name;
            },
            ftue_setCurrentActionSeq: function (e, step) {
                if (!step)
                    return;
                step.actionName = e.name;
            },
            ////////////////////////////////
            ftue_isNextStepRefSelected: function (item) {
                return this.ftue_currentStep.nextStepReference == item.name;
            },
            ftue_setCurrentNextStepRef: function (e, step) {
                if (!step)
                    return;
                step.nextStepReference = e.name;
            },
            ftue_isWebPanelSelected: function (item) {
                return this.ftue_currentStep.webPanel == item.name;
            },
            ftue_setCurrentWebPanel: function (e, step) {
                if (!step)
                    return;
                step.webPanel = e.name;
            },
            ftue_isTriggerNameSelected: function (item) {
                return this.ftue_currentStep.triggerName == item.name;
            },
            ftue_setCurrentTriggerName: function (e, step) {
                if (!step)
                    return;
                step.triggerName = e.name;
            }
        });
    });
    $$$.on('vue-validate', function () {
        if (!__SHEET.ftueSequence)
            __SHEET.ftueSequence = { steps: [] };
        if (!__SHEET.ftueSequence.steps)
            __SHEET.ftueSequence.steps = [];
        __STEPS = __SHEET.ftueSequence.steps;
        trace("VALIDATING FTUE!");
        if (__STEPS.length > 0) {
            __VUE.ftue_currentStep = __STEPS[0];
        }
        __VUE.ftue_invalidate();
    });
    $$$.on('vue-ready', function () {
        trace("vue-ready: FTUE");
    });
})(ERDS);
