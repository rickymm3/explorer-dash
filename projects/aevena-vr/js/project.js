ERDS.Project = (function () {
    function Project() {
        $$$.details = $('#details');
        $$$.views = $$$.details.find('.view');
    }
    Project.prototype.extendVue = function (vueConfig) {
        var projConfig = {
            methods: {
                onDefinableValues: function () {
                    trace("1");
                },
                onLightSequence: function () {
                    trace("1");
                },
                onActionSequence: function () {
                    trace("1");
                }
            }
        };
        return _.merge(vueConfig, projConfig);
    };
    Project.prototype.init = function () {
        ERDS.io.emit('echo', { bla: 1 });
        ERDS.io.emit('echo', { bla: 2 });
        ERDS.io.emit('echo', { bla: 3 });
        //trace($$$.views);
        //Will need "".camelToTitleCase() to convert JSON props to displayable UI fields.
    };
    return Project;
}());
