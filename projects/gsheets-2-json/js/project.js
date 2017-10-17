/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />
var __VUE, __UPLOAD, __SPINNER, __JSON, __SPINNER;
(function ($$$) {
    var lastFailedSheet = null;
    $$$.Project = function Project() { };
    $$$.keydown(function (e) {
        if (e.ctrlKey)
            __VUE.ctrlKey = true;
    });
    $$$.keyup(function (e) {
        if (!e.ctrlKey)
            __VUE.ctrlKey = false;
    });
    _.extend($$$.Project.prototype, {
        extendVue: function () {
            return {
                data: {
                    client_email: "...@...",
                    json: {},
                    ctrlKey: false,
                    currentSheet: null,
                    handlers: {
                        addSheet: {
                            onOk: function () {
                                return sendAddSpreadsheet(this.getAnswers(), __VUE.currentSheet);
                            }
                        }
                    }
                },
                methods: {
                    onAddGoogleSheet: function () {
                        this.currentSheet = null;
                        $$$.fx.show($$$.popupAddSheet);
                        if (lastFailedSheet) {
                            $$$.popupAddSheet.vue.setAnswers(lastFailedSheet);
                        }
                        else {
                            $$$.popupAddSheet.vue.clear();
                        }
                    },
                    trimmedDoc: function (httpStr) {
                        return httpStr.replace('https://docs.google.com/spreadsheets/d', 'https://...');
                    },
                    toG2JLink: function (str) {
                        return '/g2j/json/' + str;
                    },
                    toTimestamp: function (str) {
                        if (_.isNullOrEmpty(str)) {
                            return "-not available-";
                        }
                        return str;
                    },
                    editSheet: function (sheet) {
                        this.currentSheet = _.jsonClone(sheet);
                        $$$.fx.show($$$.popupAddSheet);
                        $$$.popupAddSheet.vue.setAnswers(sheet);
                    },
                    editWebhooks: function (sheet) {
                        this.currentSheet = sheet;
                        if (!sheet.webhooks || !sheet.webhooks.hooks || _.isArray(sheet.webhooks)) {
                            sheet.webhooks = { slackChannel: 'erdsbot-updates', hooks: [] };
                        }
                        TweenMax.to('#webhooks', 0.5, { alpha: 1 });
                        TweenMax.to('#webhooks', 0.5, { y: 0 });
                    },
                    onCloseWebhooks: function () {
                        var _this = this;
                        TweenMax.to('#webhooks', 0.5, { y: -10 });
                        TweenMax.to('#webhooks', 0.5, { alpha: 0, onComplete: function () {
                                _this.currentSheet = null;
                            } });
                    },
                    onAddWebhook: function (sheet) {
                        var hooks = sheet.webhooks.hooks;
                        trace("hooks...");
                        trace(hooks);
                        hooks.push({
                            guid: guid(),
                            isPostData: false,
                            isJSONResponse: false,
                            name: "Webhook " + (hooks.length + 1),
                            url: "http://www.google.com"
                        });
                        __VUE.$forceUpdate();
                    },
                    onRemoveWebhook: function (sheet, webhook) {
                        sheet.webhooks.hooks.remove(webhook);
                    },
                    onSaveWebhooks: function (sheet) {
                        sendSave(sheet)
                            .then(function () {
                            $$$.boxInfo.showBox("Successfully saved Webhook(s) to sheet: \"" + sheet.projectName + " / " + sheet.urlAlias + "\"");
                        })["catch"](function (err) {
                            var msg = err.responseText || err;
                            traceError("Could not save Webhook: " + msg);
                            $$$.boxError.showBox(msg);
                        });
                    },
                    onTestWebhooks: function (sheet, webhook) {
                        postAuthJSON({
                            url: '/g2j/test-hooks',
                            json: _.merge({ webhook: webhook }, sheet),
                            success: function (data) {
                                $$$.boxInfo.showBox('Webhook OK! :thumbsup twn twn-bounce:');
                                trace(data);
                            },
                            error: function (err) {
                                $$$.boxError.showBox("Error running the Webhook (Are the POST / JSON checkboxes correct?)");
                                trace(err.responseText);
                            }
                        });
                    },
                    removeSheet: function (sheet) {
                        sendRemoveSpreadsheet(sheet);
                    },
                    makeStableVersion: function (sheet) {
                        trace("????????");
                        postAuthJSON({
                            url: '/g2j/mark-stable',
                            json: sheet,
                            success: function (data) {
                                $$$.boxInfo.showBox('Marked new Stable Version! :thumbsup twn twn-bounce: ' + data);
                                trace(data);
                            },
                            error: function (err) {
                                var msg = err.responseText || JSON.stringify(err);
                                $$$.boxError.showBox("Error running Stable Version: " + msg);
                                trace(msg);
                            }
                        });
                    },
                    showMessage: function (title, content) {
                        $.alert({ title: title, content: content });
                    },
                    setServerStatus: function (bool) {
                        postAuthJSON({
                            url: '/g2j/status',
                            json: { status: bool, forceUpdate: __VUE.ctrlKey },
                            success: function (data) {
                                trace(data);
                            },
                            error: function (err) {
                                traceError(err);
                            }
                        });
                    }
                },
                computed: {
                    labelAddOrEdit: function () {
                        return this.currentSheet ? 'Edit' : 'Add';
                    }
                }
            };
        },
        init: function (projectData) {
            __VUE = $$$.vue;
            __VUE.json = __JSON = projectData.json;
            __SPINNER = new Spinner();
            __SPINNER.onStopBusy = function () {
                //trace("Stop being busy!");
            };
            $$$.io.on('g2j-refresh', onRefresh);
            $$$.popupAddSheet = $('#popup-add-sheet');
            $$$.popupAddSheet.vue = $$$.popupAddSheet[0].__vue__;
            //Get the client_email:
            postJSON({
                url: "/g2j/creds",
                success: function (data) {
                    __VUE.client_email = data.client_email;
                    $$$.authorization = data.authorization;
                },
                error: function (err) {
                    traceError(err);
                }
            });
            TweenMax.set('#webhooks', { alpha: 0, y: -10 });
        }
    });
    function sendAddSpreadsheet(sheet, oldSheet) {
        var found = -1;
        if (!oldSheet) {
            //If no old sheets exists, create a NEW GUID for this brand new sheet:
            sheet.guid = guid();
        }
        else {
            //Check which GUID this sheet is associated to:
            var sheets = __VUE.json.sheets;
            sheets.forEach(function (sheet, id) {
                if (sheet.guid == oldSheet.guid) {
                    return found = id;
                }
            });
            if (found < 0) {
                trace("found: " + found);
                return new Error("Could not find a matching Sheet to overwrite changes!");
            }
        }
        var isValid = true;
        _.keys(sheet).forEach(function (prop) {
            if (_.isNullOrEmpty(sheet[prop]))
                isValid = false;
        });
        if (!isValid)
            return new Error("Some fields are missing / are invalid!");
        sendSave(sheet)
            .then(function () {
            $$$.boxInfo.showBox("Successfully added sheet: \"" + sheet.projectName + " / " + sheet.urlAlias + "\"");
        })["catch"](function (err) {
            var msg = err.responseText || err;
            traceError(msg);
            $$$.boxError.showBox(msg);
        });
        return true;
    }
    function sendSave(sheet) {
        return new Promise(function (resolve, reject) {
            if (!sheet)
                return reject("sheet is null!");
            __SPINNER.startBusy(0.8, 0.5, function (done) {
                postAuthJSON({
                    url: "/g2j/add",
                    json: sheet,
                    success: function (jsonResult) {
                        done();
                        __VUE.json = jsonResult;
                        resolve();
                    },
                    error: function (err) {
                        done();
                        lastFailedSheet = sheet;
                        reject(err);
                    }
                });
            });
        });
    }
    function sendRemoveSpreadsheet(sheet) {
        var cb = function () { return __SPINNER.startBusy(0.8, 0.5, function (done) {
            postAuthJSON({
                url: "/g2j/remove",
                json: sheet,
                success: function (jsonResult) {
                    $$$.boxInfo.showBox("Successfully removed sheet: \"" + sheet.projectName + " / " + sheet.urlAlias + "\"");
                    done();
                    __VUE.json = jsonResult;
                },
                error: function (err) {
                    traceError(err);
                    $$$.boxError.showBox(err.responseText);
                    done();
                }
            });
        }); };
        $.confirm({
            title: 'Are you sure?',
            content: "Do you really wish to delete the sheet <b>\"" + sheet.urlAlias + "\"</b>?",
            buttons: {
                yes: cb,
                no: function () {
                    trace("Nothing done");
                }
            }
        });
    }
    function onRefresh(jsonData) {
        __VUE.json = jsonData;
    }
})($$$);
