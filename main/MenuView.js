'use strict';

define(function(require, exports, module){
	var $ = require('$'),
		View = require('View');

	var MenuView = View.extend({
		ctor:function(data){
			this.$super(data);
			this.data = data;
		},
		elements:{},
		render:function(){},
		events:{
			'click':{
				'select':function(target){
<<<<<<< HEAD
					this.$elem.find(this.data.itemtype || 'li').removeClass('active');
					$(target).addClass('active');
=======
					this.$elem.find(this.data.itemtype || 'li').removeClass('cur');
					$(target).addClass('cur');
>>>>>>> origin/master
				}
			}
		}
	});

	module.exports = MenuView;
});