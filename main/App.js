'use strict';

define(function(require, exports, module){
	var Node = require('Node'),
		Event = require('Event'),
		$ = require('$'),
		Net = require('Net'),
		Router = require('Router');

	var App = Node.extend({
		view:null,
		cache:{},
		config:{root:'/index'},

		ctor:function(data){
			this.config = $.extend(this.config, data);
			this.$super(this.config);
			//路由
			this.$router = Router.create(this);
			//网络
			this.$net = Net.create(this);
			//事件
			this.$event = Event.create(this);
			this.$on = this.$event.on;
			this.$off = this.$event.off;
			this.$emit = this.$event.emit;

			//会控制app跳转
			this.$router.init();

			//router事件
			var self = this;
			this.$event.on(this,'click','router',function(target){
				var url = target.getAttribute('data-href');
				if(url){
					self.$router.loadUrl(target.getAttribute('data-href'));
				}
			});
			this.$event.on(this,'click','back',function(){
				self.$router.backView();
			});
			this.__bodyhandler = {};
			//绑定click事件
			this.__bodyhandler.click = this.$event.bindEvent(this, this.$elem, 'click');
		},

		addChild:function(view){
			this.$super(view);
		},

		loadView:function(view){
			if(this.isNew){
				this.addChild(view);
			}
			this.view = view;
			this.view.render();
			//设置标题
			document.title = this.view.title || this.config.defaultTitle;
		},

		startup:function(){
			this.$router.startup();
		}
	});

	App.create = function(data){
		return new App(data);
	}

	module.exports = App;
})
