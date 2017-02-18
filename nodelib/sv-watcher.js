const chokidar = require('chokidar');

module.exports = function(ERDS) {
    if(!ERDS.isDev) {
        return trace("Skip Watcher since we're running PRODUCTION".yellow);
    }
    
    var timeoutID = -1;
    
    var requiresRestart = false;
    
    // One-liner for current directory, ignores .dotfiles 
    chokidar.watch([ERDS.__nodelib, ERDS.__projects, ERDS.__public], {ignored: /[\/\\]\./}).on('all', (event, path) => {
        path = path.fixSlashes();
        
        if (event.has('add') || 
            path.endsWith('.ts') ||
            path.endsWith('.less')) return;
        
        if(path.has('/nodelib/')) {
            ERDS.beep();
            requiresRestart = true;
            return traceError("CHANGED server-side node JS file:\n  " + path);
        }
        
        if(!ERDS.io) return;
        
        if(timeoutID>-1) clearTimeout(timeoutID);
        fileChanged(path);
    });
    
    function fileChanged(path, time) {
        if(requiresRestart) return;
        ERDS.beep();
        
        timeoutID = setTimeout(() => {
            timeoutID = -1;
            
            if(requiresRestart) return;
            ERDS.io.emit('file-changed', path);
        }, time || 500);
    }
    
    //First initial REFRESH call:
    fileChanged('');
};