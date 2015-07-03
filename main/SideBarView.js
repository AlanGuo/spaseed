'use strict';

define(function(require, exports, module){
	var $ = require('$'),
		View = require('View');
	
	var TopBottomView = View.extend({
		$elem:$('#wrapper-all'),
		/*其他控制元素*/
		elements:{
		},

		ctor:function(data){
			this.$super(data);
			this.$elem.html('<div class="header"></div><div class="body"><div class="side-bar" id="sidebar"></div><div id="container" class="container"></div></div>');
			this.elements.sidebar = $('#sidebar');
			this.elements.container = $('#container');
		},

		renderContent:function(option){
			this.elements.container.html(option.container);
			this.elements.sidebar.html(option.sidebar);
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
