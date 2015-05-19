  /**
   * 路由管理，兼容IE8以下版本
   * @class router
   * @static
   */

var router = require('./router');
 
define(function(require, exports, module) {
  var docMode = document.documentMode;
  var oldIE = (/msie [\w.]+/.test(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
  var pushState = window.history.pushState;
  
  var urls = [];
  var count = 0;

  var comprouter = router;

  comprouter.init = function (option) {

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
      var locationHref = window.location.href;
      if (/\/debug_online/.test(locationHref)) {
        this.debug = '/debug_online';
      } else if (/\/debug/.test(locationHref)) {
        this.debug = '/debug';
      }

      var _self = this,
          evt = this.option['html5Mode'] ? 'popstate' : 'hashchange';


      if (oldIE) {

        //ie8以下创建iframe模拟hashchange
        var iframe = document.createElement('iframe');
        iframe.tabindex = '-1';
        if (this.option['domain']) {
          iframe.src = 'javascript:void(function(){document.open();'+
                       'document.domain = "' + this.option['domain'] + '";document.close();}());';
        } else {
          iframe.src = 'javascript:0';
        }
        iframe.style.display = 'none';

        var _iframeOnLoad = function () {
            iframe.onload = null;
            iframe.detachEvent('onload', _iframeOnLoad);
            start();
            _self.checkUrlInterval = setInterval(function () {
              _self.checkUrl();
            }, _self.option['interval']);
        };
        if (iframe.attachEvent) {
            iframe.attachEvent('onload', _iframeOnLoad);
        } else {
            iframe.onload = _iframeOnLoad;
        }

        document.body.appendChild(iframe);
        this.iframe = iframe.contentWindow;
       
      } else {

        //其他浏览器监听popstate或hashchange
        this.addEvent(window, evt, function (e) {
          _self.checkUrl(e);
        });

      }

      if (!this.iframe) {
        _self.start();
      }
     
    };

    module.exports = comprouter;

});
