const chokidar = require('chokidar');

module.exports = function(ERDS) {
    
    // One-liner for current directory, ignores .dotfiles 
    chokidar.watch([ERDS.__projects, ERDS.__public], {ignored: /[\/\\]\./}).on('all', (event, path) => {
        if(event.has('add') || path.endsWith('.ts') || path.endsWith('.less')) return;
        if(ERDS.io) ERDS.io.emit('file-changed', path);
    });
};