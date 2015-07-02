'use strict';

define(function(require, exports, module){
	var $ = function(selector,doc){
		var elemarray;
		if(/element/i.test(Object.prototype.toString.call(selector))){
			elemarray = [selector];
		}
		else{
			elemarray = Array.prototype.slice.call((doc||document).querySelectorAll(selector));
		}

		//模拟jquery方法
		elemarray.append = function(elem){
			if(elem.length){
				for(var i=0;i<elem.length;i++){
					elemarray[0].appendChild(elem[i]);
				}
			}
			else{
				elemarray[0].appendChild(elem);
			}

			return elemarray;
		};
		elemarray.remove = function(){
			for(var i=0;i<elemarray.length;i++){
				if(elemarray[i].parentNode){
					elemarray[i].parentNode.removeChild(elemarray[i]);
				}
			}
			return elemarray;
		};
		elemarray.html = function(content){
			if(content){
				for(var i=0;i<elemarray.length;i++){
					elemarray[i].innerHTML = content;
				}
			}
			else{
				return elemarray[0].innerHTML;
			}
		};
		elemarray.addClass = function(className){
			for(var i=0;i<elemarray.length;i++){
				if(elemarray[i].className.indexOf(className) === -1){
					elemarray[i].className += ' '+className;
				}
			}
			return elemarray;
		};
		elemarray.removeClass = function(className){
			for(var i=0;i<elemarray.length;i++){
				if(elemarray[i].className.indexOf(className) > -1){
					elemarray[i].className = elemarray[i].className.replace(new RegExp('\\s*?'+className),'');
				}
			}
			return elemarray;
		};
		elemarray.data = function(name, val){
			if(val){
				for(var i=0;i<elemarray.length;i++){
					elemarray[i].setAttribute('data-'+name,val);
				}
			}
			else{
				elemarray[0].getAttribute('data-'+name);
			}

			return elemarray;
		};

		return elemarray;
	};

	//extend方法
	$.extend=function(){
		var args = Array.prototype.slice.call(arguments);
		for(var i = args.length-1;i>0;i--){
			for(var p in args[i]){
				args[i-1][p] = args[i][p];
			}
		}
		return args[0];
	};

	//ajax方法
	$.ajax = function(options){
		options = options || {};
		options.method = options.method || 'GET';
		options.url = options.url || '';
		options.async = options.async || true;
		options.data = options.data || '';

		var xhr = new XMLHttpRequest();
		xhr.onload = function(){
			var ret = JSON.parse(xhr.responseText);
			if(options.success){
				options.success.call(mpNode,ret);
			}
		}
		xhr.onerror = function(){
			if(options.error){
				options.error(xhr);
			}
		};
	    xhr.open(options.method,options.url,options.async);
	    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    xhr.send(options.data);
	};

	module.exports = $;
});
