'use strict';


define(function(require, exports, module){

	var mp = require('mp');
	var Event = require('event');
	var Net = require('net');

	var Node = mp.Class.extend({

		$:null,
		$event:null,

		nodeName:'div',

		ctor:function(data){
			if(!data){
				data = {};
			}

			this.nodeName = data.nodeName || 'div';
			this.$ = data.$ || document.createElement(this.nodeName);
			this.style = data.style || {};
			this.attribute = data.attribute || {};		

			//网络
			this.net = Net.create(this);
			
			//事件
			this.$event = Event.create(this);
			this.on = this.$event.on;
			this.off = this.$event.off;
			this.emit = this.$event.emit;

			//属性
			for(var p in this.attribute){
				this.$[p] = this.attribute[p];
			}
			//样式
			for(var p in this.style){
				this.$.style[p] = this.style[p];
			}
		},
		addChild:function(child){
			this.$.appendChild(child.$);
			child.parent = this;
		},
		removeChild:function(child){
			child.parent = null;
			this.$.removeChild(child.$);
		}
	})

	module.exports = Node;
})
