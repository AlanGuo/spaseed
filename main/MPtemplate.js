define('mp.template',function(require, exports, module){

	
	var template = require('template');
	var env = require('mp.env');


	module.exports = function(id,data){
		var obj = {$env:env};
		for(var p in data){
			obj[p] = data[p];
		}
		return template(id,obj);
	};
})
