'use strict';

define(function(require, exports, module){
	var $ = require('$');
	var pageManager = require('./pagemanager');
	var pageswitcher = require('pageswitcher');
	var config = require('config');

	var parentHtml = pageManager.html;
	//改写pageManager的html方法
	pageManager.html = function(option){
		var self = this;
		var method = pageswitcher.method[option.switchMode || config.switchMode];

		if(!option.isRefresh && method){
			var $oldWrapper = this.pageWrapper;
			var $cloneWrapper = $oldWrapper.clone();
			this.pageWrapper = $cloneWrapper;

			parentHtml.call(this,option);

			if(!option.isRefresh && method){
				$cloneWrapper.css($.extend({},method.elemIn.cssBefore,option.switchStyle));
	    		$oldWrapper.css(method.elemOut.cssBefore);

	    		$(config.switchWrapper).append($cloneWrapper);

	    		$cloneWrapper.height();

	    		$cloneWrapper.css(method.elemIn.cssAfter);
	    		$oldWrapper.css(method.elemOut.cssAfter);

	    		setTimeout(function(){
	    			$cloneWrapper.removeAttr('style');
	    			$oldWrapper.remove();
	    		},method.elemIn.duration);
			}
		}
		else{
			parentHtml.call(this,option);
		}
	}
	pageManager.pageswitcher = pageswitcher;

	module.exports = pageManager;
});