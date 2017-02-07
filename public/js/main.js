var $$$ = {};
window.addEventListener('load', function () {
    $$$.boxError = $('.box-error');
    $$$.boxInfo = $('.box-info');
    //Create a socket connection:
    ERDS.io = io();
    if (ERDS.Project) {
        ERDS.project = new ERDS.Project();
        ERDS.project.init();
    }
    ERDS.io.on("echo", function (data) { return showInfo(data); });
    ERDS.io.emit('fetch-project', ERDS.projectName);
    window.addEventListener('click', function () {
        [$$$.boxError, $$$.boxInfo].forEach(function (box) { return box.hide(); });
    });
});
ERDS.appVue = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        errors: '',
        infos: ''
    }
});
function showBox(box) {
    box.show();
    TweenMax.fromTo(box, 0.5, { alpha: 0 }, { alpha: 1 });
    TweenMax.from(box, 0.5, { y: "-=50", ease: Back.easeOut });
}
function showError(err) {
    showBox($$$.boxError);
    ERDS.appVue.errors = _.isString(err) ? err : (err ? err.responseText : "Error...");
}
function showInfo(obj) {
    showBox($$$.boxInfo);
    trace(obj);
    ERDS.appVue.infos = !_.isString(obj) && _.isObject(obj) ? JSON.stringify(obj) : obj;
}
