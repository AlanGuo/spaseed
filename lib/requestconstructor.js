'use strict';

define(function(require, exports, module) {
	var util = require('util');

	var requestconstructor = {
		create:function (option) {

			var cgi = option.url;
			var params = [];

			var tk = util.gettk('skey');
			if(tk){
				params.push('tk='+tk);
			}
			// if(window.userinfo.userId){
			// 	params.push('uin='+window.userinfo.userId);
			// }
			
			if(params.length){
				cgi += /\?/.test(cgi) ? '&' : '?';
				cgi += params.join('&');
			}

			return {
				url:cgi,
				method:option.method
			};
		}
	};

	module.exports = requestconstructor;
});
