define('mp.Net',function(require, exports, module){

	var mp = require('mp');

	function send(url,method,params,callback){
		var xhr = new XMLHttpRequest();
		xhr.onload = function(){
			callback(JSON.parse(xhr.responseText));
		}
	    xhr.open(method,url,true);
	    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    xhr.send(params);
	}

	var Net = mp.Class.extend({

		ctor:function(mpNode){

			this.ajax = function (url,method,params,callback) {
				var xhr = new XMLHttpRequest();
				xhr.onload = function(){
					var app = mpNode.parent;
					if(app){
						var ret = JSON.parse(xhr.responseText)
						if(app.config.netback){
							app.config.netback.call(mpNode,ret,callback)
						}
						else{
							callback.call(mpNode,ret);
						}
					}
				}
			    xhr.open(method,url,true);
			    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			    xhr.send(params);
			}

		},
		get:function(url,callback){
			this.ajax(url,'GET',null,callback);
		},
		post:function(url,params,callback){
			var arr = [];
			for(var p in params){
				arr.push(p+'='+encodeURIComponent(params[p]));
			}
			this.ajax(url,'POST',arr.join('&'),callback);
		}
	})

	Net.create = function(mpNode){
		return new Net(mpNode);
	}
	module.exports = Net;
})
