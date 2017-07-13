/// <reference path="main.ts" />
(function ($$$) {
    $$$.extendVue = function () {
        trace("registering comps...");
        registerComponents({
            'btn': {
                props: ['obj', 'label', 'emoji', 'icon'],
                methods: { click: function (e) { this.$emit('click', e); } },
                template: "<div class=\"btn\" v-on:click.capture.stop.prevent=\"click\">\n\t\t\t\t\t<i v-if=\"emoji\" :class=\"'v-align-mid em em-'+emoji\" aria-hidden=\"true\"></i>\n\t\t\t\t\t<i v-if=\"icon\" :class=\"'v-align-mid icon fa fa-'+icon\" aria-hidden=\"true\"></i>\n\t\t\t\t\t<i v-html=\"label\"></i>\n\t\t\t\t</div>"
            },
            'clippy': {
                props: {
                    text: { type: String, 'default': "Text to copy" },
                    on_copied: { type: String, 'default': "Copied!" }
                },
                template: "<div class=\"inline-block clippy\" :data-clipboard-text=\"text\">\n                    <a href=\"javascript: ;\">{{text}}</a>\n                    <span class=\"clippy-ok init-hidden\" v-html=\"on_copied\"></span>\n                 </div>"
            },
            'popup': {
                props: {
                    'title': String,
                    'question': String,
                    'choices': String,
                    'handler': Object,
                    'hidden': Boolean
                },
                data: function () {
                    return {
                        fields: null
                    };
                },
                computed: {
                    fieldsArr: function () {
                        return !this.fields ? [''] : this.fields._raw.map(function (t) { return t[0][0]; });
                    },
                    labelsArr: function () {
                        return !this.fields ? [''] : this.fields._raw.map(function (t) { return t[1][0]; });
                    },
                    placeholdersArr: function () {
                        return !this.fields ? [''] : this.fields._raw.map(function (t) { return t[1][1]; });
                    },
                    choicesArr: function () {
                        return !this.choices ? [''] : this.choices.split(',');
                    },
                    form: function () {
                        return $(this.$el).find('form')[0];
                    }
                },
                mounted: function () {
                    if (this.hidden) {
                        $(this.$el).hide();
                    }
                    this.fields = fieldsParser(this.getInnerText());
                },
                methods: {
                    clear: function () {
                        this.form.reset();
                    },
                    onDismiss: function (choice) {
                        var choiceMethod = 'on' + _.startCase(_.toLower(choice));
                        var response = null;
                        if (this.handler) {
                            var cb = this.handler[choiceMethod];
                            if (cb)
                                response = cb.call(this);
                            else
                                traceError("No callback by the name: " + choiceMethod);
                        }
                        else {
                            traceError("No handler objects!");
                        }
                        if (_.isError(response)) {
                            return $$$.boxError.showBox(response.message);
                        }
                        this.close();
                    },
                    close: function () {
                        $$$.fx.hide($(this.$el));
                    },
                    getAnswers: function () {
                        var answers = [];
                        $(this.$el).find('.answer').each(function (e, el) {
                            answers.push($(el).val());
                        });
                        var result = {};
                        this.fieldsArr.forEach(function (fieldName, id) {
                            result[fieldName] = answers[id];
                        });
                        return result;
                    },
                    setAnswers: function (data) {
                        var $el = $(this.$el);
                        _.keys(data).forEach(function (prop) {
                            var $input = $el.find('#' + prop);
                            $input.val(data[prop]);
                        });
                    },
                    getInnerText: function () {
                        var defSlot = this.$slots["default"];
                        return !defSlot || !defSlot.length ? '' : defSlot[0].text;
                    }
                },
                template: "<div class=\"popup\">\n                    <h3 class=\"title\">{{title}}</h3>\n                    <p>{{question}}</p>\n                    \n                    <form>\n                    <i class=\"field\" v-for=\"(field, index) in fieldsArr\">\n                       <i class=\"label\">{{labelsArr[index]}}</i>\n                       <input type=\"text\" class=\"answer long-field\"\n                            :id=\"field\"\n                            :name=\"field\"\n                            :placeholder=\"placeholdersArr[index]\"></input>\n                       <br/>\n                    </i>\n                    </form>\n                    \n                    <i class=\"choice\" v-for=\"(choice, index) in choicesArr\">\n                       <btn :label=\"choice\" @click=\"onDismiss(choice)\"></btn>\n                    </i>\n                </div>"
            }
        });
        return {};
    };
})($$$);
