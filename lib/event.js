/**
 * 事件管理
 * @class event
 * @static
 */
define(function(require, exports, module) {

	//默认判断是否有事件的函数
	var _defalutJudgeFn = function(elem){
		return !!elem.getAttribute("data-event");
	};

	//默认获取事件key的函数
	var _defaultGetEventkeyFn = function(elem){
		return elem.getAttribute("data-event");
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
	 * @param {Element} 要绑定事件的元素
	 * @param {String} 绑定的事件类型
	 * @param {Object} 事件处理的函数映射
	 * @param {Function} 取得事件对应的key的函数
	 */
	var bindCommonEvent = function (topElem, type, dealFnMap, getEventkeyFn) {
		if (type === 'click') {
			(/android/i.test(window.navigator.userAgent) || /iPod|iPad|iPhone/i.test(window.navigator.userAgent)) && (type = 'tap');
		}
		
		getEventkeyFn =  getEventkeyFn || _defaultGetEventkeyFn;
		
		var judgeFn = function (elem) {
			return !!getEventkeyFn(elem);
		};

		var hdl = function(e){
			/**
			 * 支持直接绑定方法
			 */
			var _target = getWantTarget(e, topElem, judgeFn), _hit = false;
			
			if (_target) {
				var _event = getEventkeyFn(_target);
				var _returnValue;


				if(Object.prototype.toString.call(dealFnMap)==="[object Function]"){
					_returnValue = dealFnMap.call(_target,e,_event);
					_hit = true
				}
				else{
					if(dealFnMap[_event]){
						_returnValue = dealFnMap[_event].call(_target, e)
						_hit = true;
					}
				}
				if(_hit){
					if(!_returnValue){
						if(e.preventDefault)
			                e.preventDefault();
			            else
			                e.returnValue = false;
					}
				}
				
			}
			
		}

		if (type === 'tap') {
			(function(){
				var isTap = true;
				addEvent(topElem,'touchstart',function(){
					isTap = true;
				})
				addEvent(topElem,'touchmove',function(){
					isTap = false;
				})
				addEvent(topElem,'touchend',function(e){
					if (isTap) {
						hdl(e);
					}
				})
			})()
		} else {
			addEvent(topElem, type, hdl);
		}
		
	};

	var commonEvents = {};

	var initEvent = function(type,topElem){

		

		var getEventkeyFn =   _defaultGetEventkeyFn;
		
		var judgeFn = function (elem) {
			return !!getEventkeyFn(elem);
		};
		var hdl = function(e){

			/**
			 * 支持直接绑定方法
			 */
			var _target = getWantTarget(e, topElem, judgeFn), _hit = false;
			var dealFnMap = commonEvents[type];
			
			if (_target) {

				var _event = getEventkeyFn(_target);
				var _returnValue;


				if(dealFnMap[_event]){

					_returnValue = dealFnMap[_event].call(_target, e)
					_hit = true;
				}
				if(_hit){
					if(!_returnValue){
						if(e.preventDefault)
			                e.preventDefault();
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

				})
				addEvent(topElem,'touchmove',function(e){
					
					var touch = e.touches[0];
					x2 = touch.pageX;
					y2 = touch.pageY;
					
					flag = true;
				})
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
					
				})
			})()
			
		} else {
			addEvent(topElem, type, hdl);
		}
	}

	/**
	 * 为body添加事件代理
	 * @method addCommonEvent
	 * @param {type} 事件类型
	 * @param {dealFnMap} 事件处理的函数映射
	 */
	var addCommonEvent = function(type, dealFnMap) { 

		if (type === 'click') {
				(/android/i.test(window.navigator.userAgent) || /iPod|iPad|iPhone/i.test(window.navigator.userAgent)) && (type = 'tap');
		}

		if (!commonEvents[type]) {
			commonEvents[type] = dealFnMap || {};
			initEvent(type,document.body)
		}
		else{
			for (var key in dealFnMap) {
				commonEvents[type][key] = dealFnMap[key];
			}	
		}
		
	};

	//绑定代理事件，自定义代理对象
	exports.bindCommonEvent = bindCommonEvent;

	//统一绑定body的代理事件
	exports.addCommonEvent = addCommonEvent;
});