'use strict';

define(function(require, exports, module){
	var $ = require('$'),
		Node = require('Node');
	
	var View = Node.extend({
		_:'',
		/*标题*/
		title:'',
		/*内部元素*/
		elements:{},

		$elem:$('#body-container'),

		ctor:function(data){
			this.$super(data);
			
			this.$app = data.app;
			//共享网络和事件
			this.$net = this.$app.$net;
			//事件
			this.$event = this.$app.$event;
			this.$on = this.$app.$event.on;
			this.$off = this.$app.$event.off;
			this.$emit = this.$app.$event.emit;
			this.$router = this.$app.$router;
			
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
