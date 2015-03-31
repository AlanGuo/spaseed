
define(function(require, exports, module) {
	var $ = require('$');

	var querystring = {
		get:function(name){
			var reg = new RegExp(name + '=(.*)(?:&|$)');
			var val = reg.exec(window.location.search);

			return val && val[1];
		}
	};

	module.exports = querystring;
});
