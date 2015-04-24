
define(function(require, exports, module){

	var pageManager = require('./pagemanager');
	var pageswitcher = require('pageswitcher');

	var parentHtml = pageManager.html;
	//改写pageManager的html方法
	pageManager.html = function(option){
		var self = this;
		parentHtml.call(this,option);
		var method = pageswitcher.method[option.switchMode || spaseedConfig.switchMode];

		if(method){
			var $cloneWrapper = this.pageWrapper.clone();
			$cloneWrapper.css(method.elemIn.cssBefore);
    		this.pageWrapper.css(method.elemOut.cssBefore);
    		$('body').append($cloneWrapper);
    		$cloneWrapper.height();
    		$cloneWrapper.css(method.elemIn.cssAfter);
    		this.pageWrapper.css(method.elemOut.cssAfter);

    		setTimeout(function(){
    			self.pageWrapper.remove();
    			self.pageWrapper = $cloneWrapper;
    			self.pageWrapper.removeAttr('style');
    		},method.elemIn.duration);
		}
	}
	pageManager.pageswitcher = pageswitcher;

	module.exports = pageManager;
});