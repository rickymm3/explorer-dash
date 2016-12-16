//Outputs a test page with a random color assigned to the text.

const colorNames = "green,blue,red,black,pink,orange,teal,gray,maroon".split(',');

var app;

module.exports = function(ERDS) {
	if(!ERDS.isTest) return;
	trace("OK testing routes...".cyan);
	app = ERDS.app;
	
	app.use('/test', function (req, res, next) {
		var id = (Math.random() * colorNames.length) >> 0; //Converts to int
		var colorName = colorNames[id];

		res.send(
			'<h1>This is a test! (From NodeJS)</h1>\
			 <p>The random color is.... \
			 <span style="color: $0;"><b>$1</b></span>\
			 </p>'.rep([colorName, colorName])
		);
		
		next();
	});
};