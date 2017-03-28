/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />

declare var ERDS, _, $, $$$, Vue, TweenMax, TimelineMax,
    trace, traceError, traceClear, toIcon, window, document, prompt;

var __VUE, __UPLOAD, __JSON, __CURRENT_PROJ;

(function(ERDS) {

    registerComponents({
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
    });

    ERDS.Project = function Project() {};

    _.extend(ERDS.Project.prototype, {
        extendVue(vueConfig) {
            return _.merge(vueConfig, {
                data: {
                    json: {}
                },

                methods: {
                    onUploadTo(proj) {
                        __CURRENT_PROJ = __JSON.current = proj;
                        __CURRENT_PROJ.index = __JSON.projects.indexOf(proj);
                        __UPLOAD.click();
                    },

                    copyRoot() {
                        confirmAction('copyRoot', true);
                    },

                    copyAsIs() {
                        confirmAction('copyAsIs', true);
                    },

                    clearTarget() {
                        confirmAction('clearTarget', true);
                    }
                }
            });
        },

        init(projectData) {
            __VUE = ERDS.vue;
            __VUE.json = __JSON = projectData.json;

            __UPLOAD = $('#upload-input');
            __UPLOAD.on('change', function() {
                var files = __UPLOAD[0].files;
                if(!files || !files.length) return; //No files selected.

                trace(files);
                trace("Uploading to project: " +  __CURRENT_PROJ.name);

                var formData = new FormData();
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    // add the files to formData object for the data payload
                    formData.append('uploads[]', file, file.name);
                }

                $.ajax({
                    url: '/zip-upload-transfer?proj='+__CURRENT_PROJ.index,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(data){
                        $$$.boxInfo.showBox("Successfully uploaded!");
                        onZIPUploadedOK(data);
                    },
                    error: function(err) {
                        $$$.boxError.showBox("Failed to upload! :cry:\n" + err.statusText + " - " + err.responseText);
                    }
                });
            });
        }
    });

    function onZIPUploadedOK(data) {
        var zip = JSON.parse(data);
        __VUE.json.zip = zip;
    }

    function confirmAction(action, disposeAfter=false) {
        $.ajax({
            url: '/zip-upload-confirm?action=' + action,
            success: function(data){
                $$$.boxInfo.showBox("Confirm Action Completed");
                trace(data);

                if(disposeAfter) {
                    __JSON.zip = null;
                    window.location.reload(true);
                }
            },
            error: function(err) {
                $$$.boxError.showBox("Failed to Confirm! :cry:\n" + err.statusText + " - " + err.responseText);
            }
        });
    }

})(ERDS);