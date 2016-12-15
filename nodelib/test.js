var hasJSExtension = (file, fullpath) => file.contains('.js');
trace( ERDS.filesFilter("./public", hasJSExtension) );
