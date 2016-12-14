
(function () { 'use strict'
	
	var createVueApp = function () {
		// Main Vue instance must be returned and have a root
		// node with the id "app", so that the client-side
		// version can take over once it loads.
		return new Vue({
			template: '<div id="app">You have been here for {{ counter }} seconds.</div>',
			data: {
				counter: 0
			},
			created: function () {
				var _this = this;
				setInterval(function () {
					var isEven = ((_this.timerCount += 1) % 2)==0;
					trace(isEven ? "tick" : "tock");
				}, 1000)
			}
		});
	};
	
	if (isNode()) {
		module.exports = createVueApp
	} else {
		this.vueApp = createVueApp()
	}
	
}).call(this);