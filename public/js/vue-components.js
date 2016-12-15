/**
 * Created by Chamberlain on 15/12/2016.
 */

function createVue(data) {
	return new Vue(_.assign({el: '#app'}, data));
}

/*
 * Creates a Vue Component with a standardized template ID name (ie: #tagname-tmp)
 * combined with given params.
 */
function makeVueComponent(name, params) {
	//Ensure params is assigned something:
	params = params || {};
	
	//Backup a reference of an existing *.created() method, or just `noop()`
	var onCreated = params.created || _.noop;

	/*
		Delete the original `created` method so the `_.assign()` call near the end
		doesn't accidentally merge and overwrite our defaultParams.created() method.
	 */
	delete params.created; 
	
	var defaultParams = {
		//Standardized template components to expect a '-tmp' suffix
		// (this gets auto-generated by my NodeJS/Express routing)
		template: "#"+name+"-tmp",
		
		// This part auto-adds a class name matching the registered component-name
		created: function() {
			var $el = $(this.$options.el);
			$el.addClass(this.$options.name);
			
			//Then forward this to any potential custom 'created' methods we had in 'params':
			onCreated.apply(this, arguments);
		}
	};

	//Merge default params with given custom params:
	params = _.assign(defaultParams, params);
	
	Vue.component(name, params);
}

//Register a bunch of Vue Components:
makeVueComponent("dragdropfile", {props:['action','filecolor']});
makeVueComponent("project", {props:['project']});


