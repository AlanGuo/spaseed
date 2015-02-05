define(function(require, exports, module) {
	var $ = require('../lib/zepto');
	var evt = require('../lib/event');
	var router = require('./router');
	var pageManager = require('./pagemanager');
	var spaseedConfig = require('../config.js');


	//spaseed初始化
    var init = function (config) {
    	//扩展config
    	spaseedConfig = $.extend(spaseedConfig,config);

    	//初始化页面管理
		pageManager.init();

		//初始化路由
		router.init({
			'html5Mode': true,
			'pageManager': pageManager,
			'routes': {
				'/': 'loadRoot',
				'/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)(/*p5)': 'loadCommon'
			},
			'extendRoutes': spaseedConfig.extendRoutes
		});

		//全局点击
		evt.addCommonEvent('click', { 
			'router': function () {
				var url = this.getAttribute("data-href");
				pageManager.redirect(url);
			},
			'back':function(){
				pageManager.back(this.getAttribute("data-href"));
			},
			'reload':function(){
				pageManager.reload();
			}
		});

	    //记录所有请求完毕
	    var win = window;
	    $(win).on('load',function () {
	   		win.isOnload = true;
	    });

	    window.addEventListener('touchmove', function(event) {
		   if(!pageManager.container[0].contains(event.target)) {
			event.preventDefault(); }
		}, false);

		pageManager.container.on('touchstart',function(event){
			var startY = startTopScroll = deltaY = undefined,
			startY = event.touches[0].pageY;
			startTopScroll = this.scrollTop;

			if(startTopScroll <= 0)
				this.scrollTop = 1;

			if(startTopScroll + this.offsetHeight >= this.scrollHeight)
				this.scrollTop = this.scrollHeight - this.offsetHeight - 1;
		})
    };

    module.exports = {init:init};
});
