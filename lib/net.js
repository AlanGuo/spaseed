define(function (require, exports, module) {
    var mp = require('mp'),
        $ = require('$');
    
    var objectToParams = function (obj, decodeUri) {
        var param = $.param(obj);
        if (decodeUri) {
            param = decodeURIComponent(param);
        }
        return param;
    };

    var console = window.console;

    /**
     * 网络请求
     * @class net
     * @static
     */
    var Net = mp.Class.extend({

        ctor:function(app){
            this.$app = app;
        },
        
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
                _cb = null;

            if (!_cgiConfig) {
                _cgiConfig = {
                    url: opt.url,
                    method: opt.method
                };
            }

            if (_cgiConfig) {

                // 成功回调
                _cb = function (ret) {
                    opt.cb && opt.cb(ret);
                };

                var urlParams = {
                    t: new Date().getTime()
                };

                _url = this._addParam(_cgiConfig.url, urlParams);

                if (_cgiConfig.method && _cgiConfig.method.toLowerCase() === "post") {
                    return this.post(_url, _data, _cb);
                } else {
                    return this.get(_url, _data, _cb);
                }

            }
        },

        /**
         * GET请求
         * @method get
         * @param  {String}   url    URL
         * @param  {Object}   data   参数
         * @param  {Function} cb     回调函数
         */
        get: function (url, data, cb) {
            return this._ajax(url, data, 'GET', cb);
        },
        
        /**
         * POST请求
         * @method post
         * @param  {String}   url    URL
         * @param  {Object}   data   参数
         * @param  {Function} cb     回调函数
         */
        post: function (url, data, cb) {
            return this._ajax(url, data, 'POST', cb);
        },

        request:function(options){
            var self = this;
            var request = options.request,
                data = options.data,
                success = options.success,
                error = options.error,
                button = options.button,
                eventName = null;
                //恢复按钮
                if(button){
                    var $button =  $(button);
                    eventName = $button.addClass('disabled').data('event');
                    $button[0].removeAttribute('data-click-event');
                }

            var cb = function(ret,info){
                if($button){
                    $button.removeClass('disabled')[0].setAttribute('data-click-event', eventName);
                }
                var _code = ret.code;

                var breakdefault = false;
                if(self.$app.config.netback){
                    breakdefault = self.$app.config.netback.call(self.$app,options,ret,info);
                }
                if(!breakdefault){
                    if (_code === 0) {
                        if(success){
                            success(ret.data,info);
                        }
                    } else {
                        if(error){
                            error(ret.msg,_code,ret.data,info);
                        }
                    }
                }
            }
            if(request.fakecallback){
                request.fakecallback(data, cb);
            }
            else{
                this[request.method](request.url, data, cb);
            }
        },

        _ajax: function (url, data, method, cb) {
            var self =this;
            var returnVal = null;
            var progressBar = null;

            if(this.$app.config.xhrProgress){
                progressBar = self._showProgress();
            }

            var starttime = +new Date();
            this.isBusy = true;
            (function(pbar){
                returnVal = $.ajax({
                    type: method,
                    url: url,
                    data: data,
                    success: function (data) {
                        self.isBusy = false;
                        self._hideProgress(pbar);
                        cb(data, {starttime:starttime});
                    },
                    error: function (jqXHR) {
                        self.isBusy = false;
                        self._hideProgress(pbar);
                        var data = {};
                        try{
                            data = JSON.parse(jqXHR.responseText);
                        }
                        catch(e){
                            console.error('jqXHR.responseText parse error');
                            data.code = jqXHR.status;
                            data.msg = jqXHR.statusText;
                            data.data = {};
                        }
                        cb(data, {starttime:starttime});
                    }
                });
                if(pbar){
                    returnVal.onprogress = function(evt){
                        var progressWidth = ((evt.loaded / (evt.total || (evt.loaded>1000?evt.loaded:1000))) * pbar.clientWidth*0.99) | 0;
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
            url += s + objectToParams(p);
            return url;
        }
    });

    Net.create = function(mpNode){
        return new Net(mpNode);
    };

    module.exports = Net;
});