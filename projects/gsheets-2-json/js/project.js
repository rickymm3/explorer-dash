/// <reference path="../../../public/js/main.ts" />
/// <reference path="../../../public/js/jquery-cookie.ts" />
var __VUE, __UPLOAD, __SPINNER, __JSON;
(function ($$$) {
    registerComponents({
        'btn': {
            props: ['obj', 'label', 'emoji', 'icon'],
            methods: { click: function (e) { this.$emit('click', e); } },
            template: "<div class=\"btn\" v-on:click.capture.stop.prevent=\"click\">\n\t\t\t\t\t<i v-if=\"emoji\" :class=\"'v-align-mid em em-'+emoji\" aria-hidden=\"true\"></i>\n\t\t\t\t\t<i v-if=\"icon\" :class=\"'v-align-mid icon fa fa-'+icon\" aria-hidden=\"true\"></i>\n\t\t\t\t\t<i v-html=\"label\"></i>\n\t\t\t\t</div>"
        }
    });
    $$$.Project = function Project() { };
    _.extend($$$.Project.prototype, {
        extendVue: function (vueConfig) {
            return _.merge(vueConfig, {
                data: {
                    json: {}
                },
                methods: {
                    onAddGoogleSheet: function () {
                        prompt("Enter Sheet URL");
                    },
                    copyClipboard: function (e) {
                        var textToCopy = e.target.innerHTML;
                        $(e.target).trigger('copy', textToCopy);
                    }
                }
            });
        },
        init: function (projectData) {
            __VUE = $$$.vue;
            __VUE.json = __JSON = projectData.json;
            __SPINNER = $('#spinner');
            __SPINNER.hide();
            TweenMax.set(__SPINNER, { alpha: 0 });
        }
    });
    ///////////////////////////////////////////////////
    var isBusy = false;
    function startBusy(spinTime) {
        isBusy = true;
        __SPINNER.twn = TweenMax.to(__SPINNER, spinTime, { rotation: "+=360", repeat: -1, ease: Linear.easeNone });
    }
    function stopBusy() {
        if (__SPINNER.twn) {
            __SPINNER.twn.kill();
            __SPINNER.twn = null;
            TweenMax.to(__SPINNER, 0.3, { alpha: 0 });
        }
        __UPLOAD.val('');
        isBusy = false;
    }
})($$$);
