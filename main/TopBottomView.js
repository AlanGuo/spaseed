'use strict';

define(function(require, exports, module){
	var $ = require('$'),
		View = require('View');
	
	var TopBottomView = View.extend({
		$elem:$('#wrapper-all'),
		/*内部元素*/
		elements:{
		},

		ctor:function(data){
			this.$super(data);
			this.$elem.html('<div id="top"></div><div id="container" class="scroll-content"></div><div id="bottom"></div>');
			this.elements.top = $('#top');
			this.elements.bottom = $('#bottom');
			this.elements.container = $('#container');
		},

		renderContent:function(option){
			this.elements.container.html(option.container);
			this.elements.top.html(option.top);
			this.elements.bottom.html(option.bottom);
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
			this.$super();
		}
	})

	module.exports = TopBottomView;
})
