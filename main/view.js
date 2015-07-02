'use strict';

define(function(require, exports, module){
	var Node = require('Node');
	
	var View = Node.extend({
		/*id*/
		_:'',
		/*标题*/
		title:'',
		
		/*内部元素*/
		elements:{},

		ctor:function(app){
			this.$super(app);
			
			this.$app = app;
			//共享网络和事件
			this.$net = app.$net;
			//事件
			this.$event = app.$event;
			this.$on = app.$event.on;
			this.$off = app.$event.off;
			this.$emit = app.$event.emit;
			
			//绑定events
			if(this.events){
				this.__bodyhandler = this.__bodyhandler || {};
				for(var p in this.events){
					for(var q in this.events[p]){
						this.$event.on(this,p,q,this.events[p][q]);
					}
					//绑定事件
					if(!this.__bodyhandler[p]){
						//绑定过的事件不再绑定
						if(!this.__bodyhandler[p]){
							this.__bodyhandler[p] = this.$event.bindEvent(this, this.$elem, p);
						}
					}
				}
			}
		},
		/*重载*/
		render:function(){
		},
		/*重载*/
		reload:function(){
		},
		/*重载*/
		destroy:function(){
			//移除事件
			this.$event.off(this);
		}
	})

	module.exports = View;
})
