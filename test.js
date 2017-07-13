const _ = global._ = require('lodash');
require('./nodelib/common/extensions');


////////////////////////////////////////////

AsyncEach.make(["bob", "foo", "bar"], [
	(step, item, id) => {
		trace(`test 1 ${item} #${id}`);

		setTimeout(step, 500);
	},
	(step, item, id) => {
		trace(`test 2 ${item} #${id}`);

		setTimeout(step, 250);
	}
], () => trace("DONE! Toute Finito!") );
