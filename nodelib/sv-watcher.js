const chokidar = require('chokidar');

module.exports = function(ERDS) {
    if(!ERDS.isDev) {
        return trace("Skip Watcher since we're running PRODUCTION".yellow);
    }
    
    var timeoutID = -1;
    
    // One-liner for current directory, ignores .dotfiles 
    chokidar.watch([ERDS.__nodelib, ERDS.__projects, ERDS.__public], {ignored: /[\/\\]\./}).on('all', (event, path) => {
        path = path.fixSlashes();
        
        if (event.has('add') || 
            path.endsWith('.ts') ||
            path.endsWith('.less')) return;
        
        if(path.has('/nodelib/')) return traceError("CHANGED server-side node JS file:\n  " + path);
        
        if(!ERDS.io) return;

        if(timeoutID>-1) clearTimeout(timeoutID);
        timeoutID = setTimeout(onFileChanged, 500);
    });

	function onFileChanged() {
		timeoutID = -1;
		ERDS.io.emit('file-changed', path);
	}
};