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
				var resultsArray = new Array(count);
				//不支持Promise的情况
				$(requestArray).map(function(index,item){
					(function(i){
						item.request(item.params,function(data){
							resultsArray[i] = data;
							if(!--count){
								if(success){
									success(resultsArray);
								}
							}
						},function(err){
							resultsArray[i] = err;
							if(!--count){
								if(fail){
									fail(resultsArray);
								}
							}
						});
					})(index);
				});
			}
		}
	};

	module.exports = asyncRequest;
});