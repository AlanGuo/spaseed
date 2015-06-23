define(function(require, exports, module) {
	var evt = require('event');
	var router = require('router');
	var pageManager = require('pagemanager');
	var spaseedConfig = require('config');


	//spaseed初始化
    var init = function () {
    	//初始化页面管理
		pageManager.init();

		//初始化路由
		router.init({
			'html5Mode': spaseedConfig.html5Mode,
			'pageManager': pageManager,
			'routes': {
				'/': 'loadRoot',
				'/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)': 'loadCommon'
			},
			'extendRoutes': spaseedConfig.extendRoutes
		});

		//全局点击
		evt.bindCommonEvent(null, document.body, 'click', {
			'router': function (target) {
				var url = target.getAttribute("data-href");
				pageManager.redirect(url);
			},
			'back':function(target){
				pageManager.back(target.getAttribute("data-href"));
			},
			'reload':function(){
				pageManager.reload();
			}
		});

	    //记录所有请求完毕
	    var win = window;
	    win.onload=function () {
	   		win.isOnload = true;
	   		//onload
	   		if(onload){
	   			onload();
	   		}
	    };
    };

    var onload = function(){
    	//禁止container以外的touchmove事件
   		if(spaseedConfig.disableTouchOutsideContainer){
	   		window.addEventListener('touchmove', function(event) {
			   if(!pageManager.container[0].contains(event.target)) {
					event.preventDefault(); 
				}
			}, false);

			window.addEventListener('touchstart',function(){});
	   	}
    };

    module.exports = {init:init, onload:onload};
});
