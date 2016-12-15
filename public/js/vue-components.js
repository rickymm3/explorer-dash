/**
 * Created by Chamberlain on 15/12/2016.
 */
Vue.component("my-dragdropfile", {
	template: "#tmp-dragdropfile",
	created: function() {
		
	}
});

function createVue() {
	return new Vue({
		el: '#app',
		data: {
			timerCount: 0
		},
		created: function () {
			var _this = this;
			return;
			
			setInterval(function () {
				var isEven = ((_this.timerCount += Math.random() * 3 >> 0) % 2)==0;
				//trace(isEven ? "tick" : "tock");
			}, 1000)
		}
	});
}