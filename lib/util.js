
define('spaseed/lib/util', function(require, exports, module) {
	var $ = require('zepto');
	window.console = window.console || {log:function(){}};

	var from = '';

	;(function(){
		var result = /from=(\w+)/i.exec(window.location.search)
		if(result){
			from = result[1];
		}
	})()


	/**
	 * 工具类
	 * @class util
	 * @static
	 */
	var util = {
		cookie: {
			/**
			 * 获取cookie
			 * @method get
			 * @param  {String} name 名称
			 * @return {String} 
			 */
			get: function (name) {
				var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
					m = document.cookie.match(r);

				return !m ? "" : m[1];
			},
			/**
			 * 设置cookie
			 * @method set
			 * @param {String} name 名称
			 * @param {String} value 值
			 * @param {String} domain 域
			 * @param {String} path 路径
			 * @param {String} hour 过期时间(小时)
			 */
			set: function (name, value, domain, path, hour) {
				if (hour) {
					var expire = new Date();
					expire.setTime(expire.getTime() + 36E5 * hour);
				}
				document.cookie = name + "=" + value + "; " + (hour ? "expires=" + expire.toGMTString() + "; " : "") +
					(path ? "path=" + path + "; " : "path=/; ") + (domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");

				return true;
			},
			/**
			 * 删除cookie
			 * @method del
			 * @param {String} name 名称
			 * @param {String} domain 域
			 * @param {String} path 路径
			 */
			del: function(name, domain, path) {
				document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " +
					(path ? "path=" + path + "; " : "path=/; ") +
					(domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");
			}
		},

		/**
		 * html模板生成器, =号转义, -号原始输出
		 * @method tmpl
		 * @param  {String} str html模板字符串 | script模版元素Id
		 * @param  {Object} data 用于生成模板的数据对象
		 * @param  {Object} [mixinTmpl] 混合模版对象
		 * @return {String} 返回 html 字符串
		 * @example 
		 *		var careerTmpl = '<div><%=career%></div>';
		 * 		util.tmpl('<h1><%=user%></h1> <%#careerTmpl%>', {user:'evanyuan', career: '前端工程师'}, {careerTmpl: careerTmpl});
		 */
		tmpl: function () {
      		var _cache = {},
  				_escape = function (str) {
  					str = (str || '').toString();
			    	return str.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
				},
				_getTmplStr = function (rawStr, mixinTmpl) {
					if (mixinTmpl) {
						for (var p in mixinTmpl) {
							var r = new RegExp('<%#\\s?' + p + '%>', 'g');
							rawStr = rawStr.replace(r, mixinTmpl[p]);
						}
					}
					return rawStr;
				};
      			
			return function tmpl(str, data, mixinTmpl) {
				var strIsKey = !/\W/.test(str);
        		!strIsKey && (str = _getTmplStr(str, mixinTmpl));

	        	var fn = strIsKey ? _cache[str] = _cache[str] || tmpl(_getTmplStr(document.getElementById(str).innerHTML, mixinTmpl)) :
                    new Function("obj", "_escape", "var _p='';with(obj){_p+='" + str
                        .replace(/[\r\t\n]/g, " ")
                        .split("\\'").join("\\\\'")
                        .split("'").join("\\'")
                        .split("<%").join("\t")
                        .replace(/\t-(.*?)%>/g, "'+$1+'")
                        .replace(/\t=(.*?)%>/g, "'+_escape($1)+'")
                        .split("\t").join("';")
                        .split("%>").join("_p+='")
                    + "';} return _p;");

	        	var render = function (data) {
	        		return fn(data, _escape)
	        	};

				return data ? render(data) : render;
			};
		}(),

		/**
		 * 将 URL 参数格式转化成对象
		 * @method paramsToObject
		 * @param  {String} [queryString] 要转换的 key-value 字符串，默认为 location.search
		 * @return {Object}
		 */
		paramsToObject: function (queryString) {
			var _result = {}, _pairs, _pair, _query, _key, _value;

			if (typeof(queryString) === 'object') { return queryString; }

			_query = queryString || window.location.search;
			_query = _query.replace('?', '');
			_pairs = _query.split('&');

			$(_pairs).each(function (i, keyVal) {
				_pair = keyVal.split('=');
				_key = _pair[0];
				_value = _pair.slice(1).join('=');
				_result[decodeURIComponent(_key)] = decodeURIComponent(_value);
			});

			return _result;
		},

		/**
		 * JSON对象转url字符串
		 * @method objectToParams
		 * @param  {Object} obj JSON对象
		 * @param  {Boolean} decodeUri url解码
		 * @return {String} url字符串
		 */
		objectToParams: function (obj, decodeUri) {
			var param = $.param(obj);
			if (decodeUri) {
				param = decodeURIComponent(param);
			}
			return param;
		},
		getAtk:function(name){
			var _skey = this.cookie.get(name);
			if(_skey){
				var hash = 5381;

				for (var i = 0, len = _skey.length; i < len; ++i) {
					hash += (hash << 5) + _skey.charCodeAt(i);
				}
				return hash & 0x7fffffff;
			}		
		},

		/**
		 * 是否移动手机
		 * @method isMobile
		 * @return {boolean} true|false
		 */
		isMobile: function () {
			return this.isAndroid() || this.isIOS();
		},

		/**
		 * 是否android
		 * @method isAndroid
		 * @return {boolean} true|false
		 */
		isAndroid: function () {
			return /android/i.test(window.navigator.userAgent);

		},

		/**
		 * 是否ios
		 * @method isIOS
		 * @return {boolean} true|false
		 */
		isIOS: function () {
			return /iPod|iPad|iPhone/i.test(window.navigator.userAgent)
		},

		/**
		 * 获取a标签href相对地址
		 * @method getHref
		 * @param  {Object} item dom节点
		 * @return {String} href
		 */
		getHref: function (item) {
			var href = item.getAttribute('href', 2);
			href = href.replace('http://' + location.host, '');
			return href;
		},

		/**
		 * 深度拷贝对象
		 * @method cloneObject
		 * @param  {Object} obj 任意对象
		 * @return {Object} 返回新的拷贝对象
		 */
		cloneObject: function (obj) {
			var o = obj.constructor === Array ? [] : {};
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					o[i] = typeof obj[i] === "object" ? this.cloneObject(obj[i]) : obj[i];
				}
			}
			return o;
		},

		/**
		 * 模拟滚动
		 * @method emulateScroll
		 * @param  {Object} scrollElem 任意对象
		 */
		emulateScroll:function(scrollElem){
			var startMove = false,
                initY = 0,
                containerInitY = 0,
                containerMoveY = 0;

            scrollElem.on('touchstart',function(evt){
                startMove = true;
                initY = evt.touches[0].clientY;
            });
            scrollElem.on('touchmove',function(evt){
                if(startMove){
                    var disY = evt.touches[0].clientY - initY;
                    containerMoveY = containerInitY + disY;
                    var max = scrollElem.prop('clientHeight')-scrollElem.prop('scrollHeight');
                    var val = 0;
                    if(containerMoveY < 0 && containerMoveY > max){
                    	val = containerMoveY;
                    }
                    else if(containerMoveY>0){
                    	val = 0;
                        containerMoveY = 0;
                    }
                    else if(containerMoveY<max){
                    	val = max;
                        containerMoveY = max;
                    }
                    else{
                    	val = containerMoveY;
                        containerMoveY = containerInitY;
                    }
                    scrollElem.children(':first-child').css('-webkit-transform','translate3d(0,'+val+'px,0)');

                    //把移动的值，写入属性中
                    scrollElem.attr('data-scrolltop',-val);
                    //scrollElem.scrollTop(-val);
                    var event = $.Event('scroll');
					scrollElem.trigger(event);
                }
            });
            scrollElem.on('touchend',function(){
                startMove = false;
                containerInitY = containerMoveY;
                containerMoveY = 0;
            });
		},

		/**
		 * 插入内部样式
		 * @method insertStyle
		 * @param  {string | Array} rules 样式
		 * @param  {string} id 样式节点Id
		 */
		insertStyle: function (rules, id) {
			var _insertStyle = function () {
				var doc = document,
					node = doc.createElement("style");
				node.type = 'text/css';
				id && (node.id = id);
				document.getElementsByTagName("head")[0].appendChild(node);
				if (rules) {
					if (typeof(rules) === 'object') {
						rules = rules.join('');
					}
					if (node.styleSheet) {
						node.styleSheet.cssText = rules;
					} else {
						node.appendChild(document.createTextNode(rules));
					}
				}
			};
			if (id) {
				!document.getElementById(id) && _insertStyle();
			} else {
				_insertStyle();
			}
		},
		/**
		 *统计分享时，生成随机UID	
		 * @method getRandom
		 * @param  {string} pre 前缀
		*/ 
		getRandom:function(pre){
			var pre=pre||'';
			return pre+(Math.round((Math.random()||0.5) * 2147483647) * (+new Date())) % 10000000000;
		},
		ping:function(){
			function getUserInfo(){
				var main={
					pvi:'',					
					si:'',						
					arg:'',				
					ty:1					
				}
				main.pvi=function(){
					var pvi=util.cookie.get('pgv_pvi');
					!pvi&&function(){
						main.ty=0;
						pvi=util.getRandom();
						util.cookie.set('pgv_pvi',pvi,'','',24*365)
					}();
					return pvi;
				}();
				main.si=function(){
					var si=util.cookie.get('pgv_si');
					!si&&function(){
						si=util.getRandom('s');
						util.cookie.set('pgv_si',si)
					}();
					return si;
				}();
				return main;
			}
			function getReferer(){
				
				if(from){
					return {rdm:location.hostname,rurl:'/'+from,rarg:''}	
				}
				else{
					var atag = document.createElement('a'),path;
					atag.href = document.referrer;
					return {rdm:atag.hostname,rurl:atag.path,rarg:encodeURIComponent(atag.search||'')}	
				}
				
			}

			function getEnvInfo(){
				
				var nav=navigator,sc=screen||{width:'',height:'',colorDepth:''};
				var env={
					 scr:sc.width+'x'+sc.height,
					 scl:(window.devicePixelRatio||1)+'-bit',
					 lg:nav.language.toLowerCase(),
					 tz:new Date().getTimezoneOffset()/60
				};
				
				return env;
			}
			return function(r2,dm,url,r3){
				var pool=[];
				var main = {
					r2:r2,
					dm:dm,
					url:url,
					r3:r3
				}
				for(
					var i=0,arr=[main,getUserInfo(),getReferer(),getEnvInfo(),{'random':+new Date()}],l=arr.length;
					i<l;
					i++
				){
					for(var p in arr[i]){
						arr[i].hasOwnProperty(p)&&pool.push(p+'='+(arr[i][p]||''));
					}
				}

				var src='http://pingtcss.qq.com/pingd?'+pool.join('&');
				
				var img=new Image();
				img.onload = img.onerror = img.onabort = function() {
		            img.onload = img.onerror = img.onabort = null;
		            img=null;
		        };
				img.src=src;
			}
		}()
	};

	
	;(function(){
	
		var ua = navigator.userAgent;
		var isApp = /ALA/.test(ua);

		if(isApp){
			if(util.isIOS()){
				from = "iosapp"
			}
			else if(util.isAndroid()){
				from = "androidapp"
			}
		}
	})();
	

	module.exports = util;
});
