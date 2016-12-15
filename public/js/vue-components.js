/**
 * Created by Chamberlain on 15/12/2016.
 */
Vue.component("my-dragdropfile", {
	template: "#tmp-dragdropfile",
	props:['action','filecolor'],
	/*created: function() {
		var _this = this;
		(function() {
			trace(_this.$el);
			//var myDropzone = new Dropzone(_this.$el, { url: "/file/post"});
		}).defer();
	}*/
});

function createVue() {
	return new Vue({
		el: '#app',
		data: {
			timerCount: 0
		},
		created: function () {
			var _this = this;
			
			/*
			setInterval(function () {
				var isEven = ((_this.timerCount += Math.random() * 3 >> 0) % 2)==0;
				//trace(isEven ? "tick" : "tock");
			}, 1000)
			*/
		}
	});
}