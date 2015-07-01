'use strict';

define(function(require, exports, module){
	module.exports = function(id,doc){
		return Array.prototype.slice.call((doc||document).querySelectorAll(id));
	};
});
