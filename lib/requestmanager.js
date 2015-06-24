'use strict';

define(function(require, exports, module) {
	var model = require('model');
	var requestConstructor = require('requestconstructor');

	var requestmanager = {
		add:function(name, url, method, fakecallback){
			this[name] = function(data, cb, fail, option){
				if(fakecallback){
					fakecallback(data, cb, fail, option);
				}
				else{
					model.cgiFacade(requestConstructor.get({url:url, method:method||'GET'}), data, cb, fail, option);
				}
			};
		}
	};

	module.exports = requestmanager;
});
