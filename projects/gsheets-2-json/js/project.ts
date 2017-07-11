/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />

declare var $$$, $, _, FormData, Vue, TweenMax, TimelineMax, Linear, Elastic, Clipboard,
    trace, traceError, traceClear, toIcon, window, document, prompt;

var __VUE, __UPLOAD, __SPINNER, __JSON, __SPINNER;

(function($$$) {

    $$$.Project = function Project() {};

    _.extend($$$.Project.prototype, {
        extendVue() {
            return {
                data: {
                    json: {},
                    currentSheet: null,
                    handlers: {
                        addSheet: {
                            onOk() {
                                return sendAddSpreadsheet( this.getAnswers(), __VUE.currentSheet );
                            }
                        }
                    }
                },

                methods: {
                    onAddGoogleSheet() {
                        this.currentSheet = null;
                        $$$.fx.show($$$.popupAddSheet);
                        $$$.popupAddSheet.vue.clear();
                    },

                    trimmedDoc(httpStr) {
                        return httpStr.replace('https://docs.google.com/spreadsheets/d', 'https://...')
                    },

                    editSheet(sheet) {
                        this.currentSheet = sheet;
                        $$$.fx.show($$$.popupAddSheet);
                        $$$.popupAddSheet.vue.setAnswers(sheet);
                    },

                    removeSheet(sheet) {
                        var ok = confirm(`Are you sure you want to delete the sheet "${sheet.urlAlias}"?`);
                        if(!ok) return;

                        sendRemoveSpreadsheet(sheet);
                    }
                },
                computed: {
                    labelAddOrEdit() {
                        return this.currentSheet ? 'Edit' : 'Add';
                    }
                }
            };
        },

        init(projectData) {
            $$$.authorization = "erds.gsheets-2-json";

            __VUE = $$$.vue;
            __VUE.json = __JSON = projectData.json;

            __SPINNER = new Spinner();
            __SPINNER.onStopBusy = () => {
                //trace("Stop being busy!");
            };

            $$$.popupAddSheet = $('#popup-add-sheet');
            $$$.popupAddSheet.vue = $$$.popupAddSheet[0].__vue__;
        },
    });


    function sendAddSpreadsheet(sheet, oldSheet ) {
        if(!oldSheet) {
            //If no old sheets exists, create a NEW GUID for this brand new sheet:
            sheet.guid = guid();
        } else {
            //Check which GUID this sheet is associated to:
            var sheets = __VUE.json.sheets;
            var found = -1;
            sheets.forEach((sheet, id) => {
                if(sheet.guid==oldSheet.guid) {
                    return found = id;
                }
            });

            if(found<0) {
                trace("found: " + found);
                return new Error("Could not find a matching Sheet to overwrite changes!");
            }

            sheet.guid = oldSheet.guid;
            sheets[found] = sheet;
        }

        var isValid = true;
        _.keys(sheet).forEach(prop => {
            if(_.isNullOrEmpty(sheet[prop])) isValid = false;
        });

        if(!isValid) return new Error("Some fields are missing / are invalid!");

        __SPINNER.startBusy(0.8, 0.5, (done) => {
            postAuthJSON({
                url: "/g2j/add",
                json: sheet,
                success(jsonResult) {
                    $$$.boxInfo.showBox(`Successfully added sheet: "${sheet.projectName} / ${sheet.urlAlias}"`);
                    done();

                    __VUE.json = jsonResult;
                },
                error(err) {
                    traceError(err);
                    $$$.boxError.showBox(err.responseText);
                    done();
                }
            });
        });

        return true;
    }

    function sendRemoveSpreadsheet(sheet) {
        __SPINNER.startBusy(0.8, 0.5, (done) => {
            postAuthJSON({
                url: "/g2j/remove",
                json: sheet,
                success(jsonResult) {
                    $$$.boxInfo.showBox(`Successfully removed sheet: "${sheet.projectName} / ${sheet.urlAlias}"`);
                    done();

                    __VUE.json = jsonResult;
                },
                error(err) {
                    traceError(err);
                    $$$.boxError.showBox(err.responseText);
                    done();
                }
            });
        });
    }

})($$$);