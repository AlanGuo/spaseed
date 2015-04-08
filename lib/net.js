define(function (require, exports, module) {
    var $ = require('./$');
    var util = require('./util');
    var spaseedConfig = require('../config');
    var console = window.console;

    /**
     * 网络请求
     * @class net
     * @static
     */
    var net = {
        _progressBar:[],
        /**
         * 发起请求
         * @method send
         * @param  {Object} cgiConfig 配置
         * @param  {Object} opt       选参
         */
        send: function (cgiConfig, opt) {
            var _self = this,
                _cgiConfig = cgiConfig,
                _data = opt.data || {},
                _url = "",
                _cb = null,
                _global = opt.global;

            if (!_cgiConfig) {
                _cgiConfig = {
                    url: opt.url,
                    method: opt.method
                };
            }

            if (_cgiConfig) {

                // 成功回调
                _cb = function (ret) {

                    if (typeof(ret) === 'string') {
                        ret = eval('(' + ret + ')');
                    }

                    // 使用友好的提示消息
                    if (ret && ret['uiMsg']) {
                        // 如果有内部错误消息，则输出log
                        console && console.warn && (ret['code'] !== 0 && console.warn('错误 code=' + ret['code'] + ',msg=' + ret['msg']));
                        ret['msg'] = ret['uiMsg'] + '[#' + ret['code'] + ']';
                        delete ret['uiMsg'];
                    }

                    opt.cb && opt.cb(ret);
                };

                var urlParams = {
                    t: new Date().getTime()
                };

                if (spaseedConfig.additionalUrlParam) {
                    $.extend(urlParams, spaseedConfig.additionalUrlParam())
                }

                _url = this._addParam(_cgiConfig.url, urlParams);

                if (_cgiConfig.method && _cgiConfig.method.toLowerCase() === "post") {
                    return this.post(_url, _data, _cb, _global);
                } else {
                    return this.get(_url, _data, _cb, _global);
                }

            }
        },

        /**
         * GET请求
         * @method get
         * @param  {String}   url    URL
         * @param  {Object}   data   参数
         * @param  {Function} cb     回调函数
         * @param  {Boolean}  global 是否触发全局 AJAX 事件
         */
        get: function (url, data, cb, global) {
            return this._ajax(url, data, 'GET', cb, global);
        },
        
        /**
         * POST请求
         * @method post
         * @param  {String}   url    URL
         * @param  {Object}   data   参数
         * @param  {Function} cb     回调函数
         * @param  {Boolean}  global 是否触发全局 AJAX 事件
         */
        post: function (url, data, cb, global) {
            return this._ajax(url, data, 'POST', cb, global);
        },

        _ajax: function (url, data, method, cb, global) {
            var self =this;
            (global == undefined) && (global = true);
            var returnVal = null;
            var progressBar = null;

            if(spaseedConfig.xhrProgress){
                progressBar = self._showProgress();
            }
            (function(pbar){
                returnVal = $.ajax({
                    type: method,
                    url: url,
                    data: data,
                    global: global,
                    success: function (data) {
                        self._hideProgress(pbar);
                        cb(data);
                    },
                    error: function (jqXHR) {
                        self._hideProgress(pbar);
                        if (window.isOnload) {//避免页面刷新时, 出小黄条错误
                            cb({ ret: jqXHR.status });
                        }
                    }
                });
                if(pbar){
                    returnVal.onprogress = function(evt){
                        var progressWidth = ((evt.loaded / (evt.total || (evt.loaded>1000?evt.loaded:1000))) * pbar.clientWidth*0.99) | 0;
                        //pbar.style.width = progressWidth + 'px';
                    };
                }
            })(progressBar);

            return returnVal;
        },

        _showProgress: function(){
            var progressBar = document.createElement('div');
            progressBar.setAttribute('style', 'position:fixed;height:3px;top:0;background:green;'+
                'transition:all .6s ease;width:0;z-index:100');

            document.body.appendChild(progressBar);
            progressBar.style.width = document.body.clientWidth+'px';

            return progressBar;
        },
        _hideProgress: function(elem){
            if(elem){
                document.body.removeChild(elem);
            }
        },

        _addParam: function (url, p) {
            var s = /\?/.test(url) ? '&' : '?';
            url += s + util.objectToParams(p);
            return url;
        }
    };
    module.exports = net;
});