'use strict';

define(function(require, exports, module){
	var Router = require('Router');

	var HashRouter = Router.extend({

		ctor:function(app){
			this.$app = app;
		},

		init:function(){
			var self = this;
			window.addEventListener('hashchange',function(e){
				var newHash = location.hash.substring(1);
				self.loadUrl(newHash);
			});

			//first time load
			var newHash = location.hash.substring(1);
			self.loadUrl(newHash);
		},

		pop:function(){
			history.go(-1);
		}
	});

	HashRouter.create = function(app){
		return new HashRouter(app);
	}

	module.exports = HashRouter;
})
