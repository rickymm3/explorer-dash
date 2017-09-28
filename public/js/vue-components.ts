/// <reference path="main.ts" />

(function($$$) {
    $$$.extendVue = function() {
        trace("registering comps...");

        registerComponents({
            'btn': {
                props: ['obj', 'label', 'emoji', 'icon'],
                methods: { click(e) { this.$emit('click', e); } },
                template:
                    `<div :class="'btn ' + icon" v-on:click.capture.stop.prevent="click">
					<i v-if="emoji" :class="\'v-align-mid em em-\'+emoji" aria-hidden="true"></i>
					<i v-if="icon" :class="\'v-align-mid icon fa fa-\'+icon" aria-hidden="true"></i>
					<i v-html="label"></i>
				</div>`
            },

            'clippy': {
                props: {
                    text: {type: String, 'default':"Text to copy"},
                    on_copied: {type: String, 'default': "Copied!"}
                },

                template:
                    `<div class="inline-block clippy" :data-clipboard-text="text">
                    <a href="javascript: ;">{{text}}</a>
                    <span class="clippy-ok init-hidden" v-html="on_copied"></span>
                 </div>`
            },

            'popup': {
                props: {
                    'title':String,
                    'question':String,
                    'choices':String,
                    'handler':Object,
                    'hidden':Boolean
                },

                data() {
                  return {
                      fields: null
                  }
                },

                computed: {
                    fieldsArr() {
                        return !this.fields ? [''] : this.fields._raw.map(t => t[0][0]);
                    },
                    labelsArr() {
                        return !this.fields ? [''] : this.fields._raw.map(t => t[1][0]);
                    },
                    placeholdersArr() {
                        return !this.fields ? [''] : this.fields._raw.map(t => t[1][1]);
                    },
                    choicesArr() {
                        return !this.choices ? [''] :  this.choices.split(',');
                    },
                    form() {
                        return $(this.$el).find('form')[0];
                    }
                },

                mounted() {
                    if(this.hidden) {
                        $(this.$el).hide();
                    }

                    this.fields = fieldsParser(this.getInnerText());
                },

                methods: {
                    clear() {
                        this.form.reset();
                    },

                    onDismiss(choice) {
                        var choiceMethod = 'on' + _.startCase(_.toLower(choice));
                        var response = null;
                        if(this.handler) {
                            var cb = this.handler[choiceMethod];
                            if(cb) response = cb.call(this);
                            else traceError("No callback by the name: " + choiceMethod);
                        } else {
                            traceError("No handler objects!");
                        }

                        if(_.isError(response)) {
                            return $$$.boxError.showBox(response.message);
                        }

                        this.close();
                    },

                    close() {
                        $$$.fx.hide($(this.$el));
                    },

                    getAnswers() {
                        var answers = [];
                        $(this.$el).find('.answer').each((e, el) => {
                            answers.push($(el).val());
                        });

                        var result = {};

                        this.fieldsArr.forEach((fieldName, id) => {
                            result[fieldName] = answers[id];
                        });
                        return result;
                    },

                    setAnswers(data) {
                        var $el = $(this.$el);

                        _.keys(data).forEach(prop => {
                            var $input = $el.find('#' + prop);
                            $input.val(data[prop]);
                        });
                    },

                    getInnerText() {
                        var defSlot = this.$slots.default;
                        return !defSlot || !defSlot.length ? '' : defSlot[0].text;
                    },

                },

                template:
                `<div class="popup">
                    <h3 class="title">{{title}}</h3>
                    <p>{{question}}</p>
                    
                    <form>
                    <i class="field" v-for="(field, index) in fieldsArr">
                       <i class="label">{{labelsArr[index]}}</i>
                       <input type="text" class="answer long-field"
                            :id="field"
                            :name="field"
                            :placeholder="placeholdersArr[index]"></input>
                       <br/>
                    </i>
                    </form>
                    
                    <i class="choice" v-for="(choice, index) in choicesArr">
                       <btn :label="choice" @click="onDismiss(choice)"></btn>
                    </i>
                </div>`
            }
        });

        return {};
    };

})($$$);