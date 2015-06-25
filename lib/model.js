'use strict';

define(function(require, exports, module) {
	var $ = require('$');
	var net = require('net');
	var dialog = require('dialog');
	var pageManager = require('pagemanager');
	var stats = require('stats');
	var config = require('config');

	//数据管理
	var manager = {
		isBusy:false,
		//所有正常cgi调用都通过这个门面方法进行调用
		cgiFacade:function(cgi, data, cb, fail, option){
			var eventName = '';
			var startTime = new Date();
			var _cb = function (ret) {
				var	_code = ret.code;
				manager.isBusy = false;

				if(config.defaultStats){
					//cgi返回码统计
					stats.trackEvent('cgi',cgi.url.split('?')[0],ret.code,new Date()-startTime);
				}

				//恢复按钮
				if(option.button){
					$(option.button).removeClass('disabled').data('event', eventName);
				}

				if (_code === 0) {
					if(cb){
						cb(ret.data);
					}
				} else if(_code === 403){
					dialog.hide();
					pageManager.redirect('account','login',null,{pathname:encodeURIComponent(location.pathname)});
				} else {
					if(fail){
						fail(ret.msg,_code,ret.data);
					}
					else{
						var str = config.defaultReqErr;
						
						if(config.showDetailError){
							str = ret.msg || config.defaultReqErr;
						}
						if(pageManager.isEmpty()){
							pageManager.renderError(str);
						}
						else{
							dialog.msgbox(str);
						}
					}
				}
			};

			this.isBusy = true;
			//获取服务端数据
			net.send(cgi,{
				data: data,
				cb: _cb,
				url: cgi
			});

			option = option||{};
			//禁用按钮
			if(option.button){
				eventName = $(option.button).addClass('disabled').data('event');
				$(option.button).removeAttr('data-click-event');
			}
		}
	};

	module.exports = manager;
});
