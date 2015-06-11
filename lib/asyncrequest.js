/**
 * promise
 * @class promise
 * @static
 */
define(function(require, exports, module) {
	var $ = require('$');

	var asyncRequest = {
		all:function(requestArray, success, fail){
			if(window.Promise){
				var promiseFunctionArray = [];
				$(requestArray).map(function(index,item){
					promiseFunctionArray.push(new Promise(function(resolve, reject){
						item.request(item.params,function(data){
							resolve(data);
						},function(err){
							reject(err);
						});
					}));
				});

				Promise.all(promiseFunctionArray).then(function(values){
		           if(success){
		           	success(values);
		           }
		        }).catch(function(errs){
		        	if(fail){
		        		fail(errs);
		        	}
		        });
			}else{
				var count = requestArray.length;
				var resultsArray = [];
				//不支持Promise的情况
				$(requestArray).map(function(index,item){
					item.request(item.params,function(data){
						resultsArray.push(data);
						if(!--count){
							if(success){
								success(resultsArray);
							}
						}
					},function(err){
						resultsArray.push(err);
						if(!--count){
							if(fail){
								fail(resultsArray);
							}
						}
					});
				});
			}
		}
	};

	module.exports = asyncRequest;
});