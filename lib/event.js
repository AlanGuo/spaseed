/**
 * 事件管理
 * @class event
 * @static
 */
define(function(require, exports, module) {
	var util = require('util');

	//事件处理方法
	var _handlers = {};

	//默认判断是否有事件的函数
	var _defalutJudgeFn = function(elem, type){
		return !!elem.getAttribute('data-'+type+'-event');
	};

	//默认获取事件key的函数
	var _defaultGetEventkeyFn = function(elem, type){
		return elem.getAttribute('data-'+type+'-event');
	};

	//添加事件监听
	var addEvent = function (elem, event, fn) {
		if (elem.addEventListener)  // W3C
			elem.addEventListener(event, fn, true);
		else if (elem.attachEvent) { // IE
			elem.attachEvent("on"+ event, fn);
		}
		else {
			elem[event] = fn;
		}
	};
	//移除事件监听
	var removeEvent = function(elem, event, fn){
		if (elem.removeEventListener)  // W3C
			elem.removeEventListener(event, fn);
		else if (elem.attachEvent) { // IE
			elem.detachEvent("on"+ event, fn);
		}
	};
	
	//获取元素中包含事件的第一个子元素
	var getWantTarget = function(evt, topElem, judgeFn){
		
		judgeFn = judgeFn || this.judgeFn || _defalutJudgeFn;
		
		var _targetE = evt.srcElement || evt.target;
		
		while( _targetE  ){
			
			if(judgeFn(_targetE)){
				return _targetE;
			}
			
			if( topElem == _targetE ){
				break;
			}
		
			_targetE = _targetE.parentNode;
		}
		return null;
	};

	/**
	 * 通用的绑定事件处理
	 * @method bindCommonEvent
	 * @param {Element} topElem 要绑定事件的元素
	 * @param {String} type 绑定的事件类型
	 * @param {Object} handlerMap 事件处理的函数映射
	 * @param {Function} getEventkeyFn 取得事件对应的key的函数
	 */
	var bindCommonEvent = function (topElem, type, handlerMap, getEventkeyFn) {
		handlerMap = handlerMap || _handlers[type];

		if (type === 'click') {
			util.isMobile() && type = 'tap';
		}
		
		getEventkeyFn =  getEventkeyFn || _defaultGetEventkeyFn;
		
		var judgeFn = function (elem, type) {
			return !!getEventkeyFn(elem, type);
		};

		var hdl = function(e){
			/**
			 * 支持直接绑定方法
			 */
			var _target = getWantTarget(e, topElem, judgeFn), _hit = false;
			
			if (_target) {
				var _event = getEventkeyFn(_target, type);
				var _returnValue;

				if(/Function/i.test(Object.prototype.toString.call(handlerMap))){
					_returnValue = handlerMap.call(_target,e,_event);
					_hit = true;
				}
				else{
					if(handlerMap[_event]){
						_returnValue = handlerMap[_event].call(_target, e);
						_hit = true;
					}
				}
				if(_hit){
					if(!_returnValue){
						if(e.preventDefault){
			                e.preventDefault();
						}
			            else
			                e.returnValue = false;
					}
				}
			}
		}

		if (type === 'tap') {
			(function(){

				var x1=0,y1=0,x2=0,y2=0,flag = false;
				addEvent(topElem,'touchstart',function(e){

					var touch = e.touches[0];
					x1 = touch.pageX;
					y1 = touch.pageY;

					flag = false;

				});
				addEvent(topElem,'touchmove',function(e){
					
					var touch = e.touches[0];
					x2 = touch.pageX;
					y2 = touch.pageY;
					
					flag = true;
				});
				addEvent(topElem,'touchend',function(e){
					if(flag){
						var offset = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
						if(offset < 5){
							hdl(e)
						}
					}
					else{
						hdl(e)
					}
					
				});
			})();
		} else {
			addEvent(topElem, type, hdl);
		}
		//返回hdl用来解绑
		return hdl;
	};

	/**
	 * 为topElem解绑元素
	 * @method unbindCommonEvent
	 * @param {type} 事件类型
	 * @param {dealFn} 事件处理的函数
	 */
	var unbindCommonEvent = function(topElem, type, handler){
		if(hander){
			if(type === 'click' && util.isMobile()){
				//解绑touch事件
			}
			else{
				removeEvent(topElem, type, handler);
			}
		}
	};

	/**
	 * 为body添加事件代理
	 * @method bindBodyEvent
	 * @param {string} type 事件类型
	 */
	var bindBodyEvent = function(type) {
		return bindCommonEvent(document.body, type);		
	};

	/**
	 * 为body添加事件代理
	 * @method unbindBodyEvent
	 * @param {string} type 事件类型
	 * @param {function} bodyHandler 事件处理的函数
	 */
	var unbindBodyEvent = function(type, bodyHandler) { 
		if(bodyHandler){
			unbindCommonEvent(document.body, type, bodyHandler);		
		}
	};

	/**
	 * 为body添加事件代理
	 * @method bindBodyEvent
	 * @param {string} eventName 事件类型
	 * @param {function} handler 事件处理的函数
	 */
	var on = function(eventName,handler){
		_handlers[eventName] = _handlers[eventName] || [];
		_handlers[eventName].push(handler);
	};
	var off = function(eventName, handler){
		if(!handler){
			if(_handlers[eventName]){
				_handlers[eventName] = [];
			}
		}
		else{
			if(_handlers[eventName]){
				for(var i=0;i<_handlers[eventName].length;i++){
					if(_handlers[eventName][i] === handler){
						_handlers[eventName].splice(i,1);
					}
				}
			}
		}
	};

	//绑定代理事件，自定义代理对象
	exports.bindCommonEvent = bindCommonEvent;
	exports.unbindCommonEvent = unbindCommonEvent;

	//统一绑定body代理事件
	exports.bindBodyEvent = bindBodyEvent;
	exports.unbindBodyEvent = unbindBodyEvent;
	exports.on = on;
	exports.off = off;
});