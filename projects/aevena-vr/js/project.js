ERDS.Project = (function () {
    function Project() {
        ERDS.io.emit("echo", { foo: 'bar' });
        ERDS.io.emit("echo", "Hello World 1");
        ERDS.io.emit("echo", "Hello World 2");
        ERDS.io.emit("echo", "Hello World 3");
        ERDS.vue = new Vue({
            el: '#details',
            data: {}
        });
        //Will need "".camelToTitleCase() to convert JSON props to displayable UI fields.
    }
    Project.prototype.init = function () {
        trace("Init this...");
    };
    return Project;
}());
