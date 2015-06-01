  /**
   * 路由管理
   * @class router
   * @static
   */

define(function(require, exports, module) {

  var config = require('config');
  
  var win = window;
  var pushState = win.history.pushState;
  var urls = [];
  var count = 0;

  var router = {

    option:{

      //是否使用html5 history API设置路由
      'html5Mode': true,

      //页面管理对象
      'pageManager': {},

      //路由映射对象
      'routes': {},

      //扩展路由，优先于框架内部路由routes对象
      'extendRoutes': {},

      //低端浏览器监听url变化的时间间隔
      'interval': 50,

      //低端浏览器如设置了domain, 需要传入
      'domain': ''

    },

    start : function () {
        var initPath = this.getFragment() ? this.getFragment() : '/';

        if (initPath === '/index.html') {
          initPath = '/';
        }

        var locationHref = win.location.href;

        //完整路径在hash环境打开则转化为锚点路径后跳转
        if (!this.option['html5Mode'] && !/#(.*)$/.test(locationHref) && initPath !== '/') {
          location.replace('/#' + initPath);
          return;
        }

        this.navigate(initPath, config.silentRefresh, true);
    },
    /**
     * 初始化
     * @param {Object} option 参数
     * @method init
     */
    init: function (option) {

      option = option || {};

      for (var p in option) {
        this.option[p] = option[p];
      }

      //扩展路由
      if (this.option['extendRoutes']) {
        this.extend(this.option['extendRoutes']);
      }

      this.option['html5Mode'] = (pushState && this.option['html5Mode']);

      //支持debug模式(url加上debug后不改变页面切换逻辑,可有针对性做一些事情)
      this.debug = false;
      var locationHref = win.location.href;
      if (/\/debug_online/.test(locationHref)) {
        this.debug = '/debug_online';
      } else if (/\/debug/.test(locationHref)) {
        this.debug = '/debug';
      }

      var _self = this,
          evt = this.option['html5Mode'] ? 'popstate' : 'hashchange';

      //其他浏览器监听popstate或hashchange
      this.addEvent(win, evt, function (e) {
        _self.checkUrl(e);
      });

      this.start();
    },

    /**
     * 事件监听
     */
    addEvent: function (elem, event, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
      } else if (elem.attachEvent) { 
        elem.attachEvent("on" + event, fn);
      } else {
        elem[event] = fn;
      }
    },

    /**
     * 获取hash值
     * @method getHash
     * @param {Object} win 窗口对象
     * @return {String} hash值
     */
    getHash: function (win) {
      var match = (win || window).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    /**
     * 获取url片段
     * @method getFragment
     * @return {String} url片段
     */
    getFragment: function () {
      var fragment, 
          pathName = win.location.pathname+win.location.search;

      if (this.option['html5Mode']) {
        fragment = pathName;
        //如果锚点路径在html5Mode环境打开 
        if (fragment === '/' && this.getHash()) {    
          fragment = this.getHash();
        }
      } else {
        fragment = this.getHash();
        //如果完整路径在hash环境打开
        if (fragment === '' && pathName !== '/' && pathName !== '/index.html') { 
          fragment = pathName;
        }
      }
      return fragment;
    },

    /**
     * 监听url变化
     */
    checkUrl: function (e) {
      var current = this.getFragment();
      if (this.debug) {
        current = current.replace(this.debug, '');
      }
      if (this.iframe) {
        current = this.getHash(this.iframe);
      }
      if (current === this.fragment) {
        return
      }

      if(typeof e == 'object' && e.state){
          count = e.state.count - 1;
      }
      this.navigate(current, false, true);
    },
    back:function(){


        history.back();
        //if(count -1 >0){
        
           /*
        }
        else{
          this.navigate('/')
        }
        */
    },

    /**
     * 去除前后#和hash
     */
    stripHash: function (url) {
      return url.replace(/^\#+|\#+$/g, '');
    },

    /**
     * 去除前后斜杠
     */
    stripSlash: function (url) {
      return url.replace(/^\/+|\/+$/g, '');
    },

    /**
     * 导航
     * @method navigate
     * @param {String}  url 地址
     * @param {Boolean} slient 不改变地址栏
     * @param {Boolean} replacement 替换浏览器的当前会话历史(h5模式时支持)
     */
    navigate: function (url, slient, replacement) {

      if(!replacement){
        count++;
      }

      var _self = this;
      
      if (url !== '/') {
        url = _self.stripHash(url);
        url = _self.stripSlash(url);
        url = '/' + url; 
      }
      
      if (url !== _self.fragment && !slient) {//slient为true时，只路由不改变地址栏
        if (_self.debug) {
          url = url.replace(_self.debug, '');
          url = _self.debug + url;
        }
        if (_self.option['html5Mode']) {
          var _stateFun = replacement ? 'replaceState' : 'pushState';
          history[_stateFun]({count:count}, document.title, url);
        } else {
          if (url !== '/' || _self.getFragment()) {
            location.hash = url; 
            _self.iframe && _self.historySet(url, _self.getHash(_self.iframe));
          } 
        }
      }

      if (_self.debug) {
        url = url.replace(_self.debug, '');
        !url && (url = '/');
      }

      /**
       * 当前url片段
       * @property fragment
       * @type String
       */
      _self.fragment = url;

      url = url.split('?')[0];

      _self.loadUrl(url);
      
    },

    /**
     * 重定向
     * @method redirect
     * @param {String}  url 地址
     * @param {Boolean} slient 不改变地址栏
     * @param {Boolean} replacement 替换浏览器的当前会话历史(h5模式时支持)
     */
    redirect: function (url, slient, replacement) {
      this.navigate(url, slient, replacement);
    },

    /**
     * 路由匹配
     * @method matchRoute
     * @param  {String} rule 路由规则
     * @param  {String} url 地址
     * @return {Array}  参数数组
     */
    matchRoute: function (rule, url) {
      var optionalReg = /\((.*?)\)/g,
          paramReg = /(\(\?)?:\w+/g,
          astReg = /\*\w+/g,
          ruleToReg = function (rule) {
            rule = rule.replace(optionalReg, '(?:$1)?').replace(paramReg, '([^\/]+)').replace(astReg, '(.*?)');
            return new RegExp('^' + rule + '$');
          },
          route = ruleToReg(rule),
          result = route.exec(url),
          params = null;

      if (result) {
        var args = result.slice(1);
        params = [];
        for (var i = 0, p; p = args[i]; i++){      
           params.push(p ? decodeURIComponent(p) : ''); 
        }
      }
      return params;
    },

    /**
     * 扩展路由
     * @method extend
     * @param {Object} obj 路由map
     */
    extend: function (obj) {
      obj = obj || {};
      if (this.extendRoutes) {
        $.extend(this.extendRoutes, obj);
      } else {
        this.extendRoutes = obj;
      }
    },

    /**
     * queryString转对象
     */
    queryToObj: function (queryStr) {
      var urlPara = queryStr.split('?')[1];
      urlPara = urlPara.split('&');
      var objPara = {};
      for (var i=0, item; item = urlPara[i]; i++) {
        var itemArr = item.split('=');
        objPara[itemArr[0]] = itemArr[1];
      }
      return objPara;
    },

    /**
     * 执行路由匹配的方法
     */
    applyAction: function (action, params, urlParam, pointer) {
      urlParam && params.push(urlParam);
      action && action.apply(pointer, params);
    },

    /**
     * 加载页面
     * @method loadUrl
     * @param {String} url 地址
     */
    loadUrl: function (url) {
      var _self = this,
          extendRoutes = _self.extendRoutes,
          routes = _self.option.routes,
          pm = _self.option.pageManager,
          params = null,
          urlParam = null,
          searchReg = /\/?\?.*/,
          searchMatch = searchReg.exec(url),
          url = url.replace(searchReg,'');

      searchMatch && (urlParam = this.queryToObj(searchMatch[0]));

      //优先匹配框架外部定义路由
      
      if (extendRoutes) {
        for (var exRule in extendRoutes) {
          if (params = _self.matchRoute(exRule, url)) {
            this.applyAction(extendRoutes[exRule], params, urlParam, null);
            return;
          }
        }
      }
      
      //匹配框架内部路由规则
      for (var rule in routes) {
          if (params = _self.matchRoute(rule, url)) {
            this.applyAction(pm[routes[rule]], params, urlParam, pm);
            break;
          }
      } 
    }

  };

  module.exports = router;

});
