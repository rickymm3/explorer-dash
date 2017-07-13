const chokidar = require('chokidar');

module.exports = function($$$) {
    if(!$$$.isDev) {
        return trace("Skip Watcher since we're running PRODUCTION".yellow);
    }
    
    var timeoutID = -1;
    
    var requiresRestart = false;
    
    // One-liner for current directory, ignores .dotfiles 
    chokidar.watch([$$$.__nodelib, $$$.__projects, $$$.__public], {ignored: /[\/\\]\./}).on('all', (event, path) => {
        path = path.fixSlashes();
        
        if (event.has('add') || 
            path.has('.ts') ||
            path.has('.less')) return;
        
        if(path.has('/nodelib/')) {
            $$$.beep();
            requiresRestart = true;
            return traceError("CHANGED server-side node JS file:\n  " + path);
        }

        trace("File changed: " + path);

        if(!$$$.io) return;
        
        if(timeoutID>-1) clearTimeout(timeoutID);
        fileChanged(path);
    });
    
    function fileChanged(path, time) {
        if(requiresRestart) return;
        $$$.beep();
        
        timeoutID = setTimeout(() => {
            timeoutID = -1;
            
            if(requiresRestart) return;
            $$$.io.emit('file-changed', path);
        }, time || 500);
    }
    
    //First initial REFRESH call:
    fileChanged('');
};