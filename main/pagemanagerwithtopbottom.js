'use strict';

define(function(require, exports, module){
	var $ = require('$'),
		pageManager = require('./pagemanagerwithpageswitcher'),
		config = require('config'),
		util = require('util');

	/**
	 * 框架的渲染方法
	 * @param {Object} option 选项
	 * @param {Element} option.container 容器
	 * @param {Element} option.top 顶部
	 * @param {Element} option.bottom 底部
	 * @param {Element} option.scroll 滚动距离
	 * @param {String} option.exclusiveTopClassName 独占的顶部样式
	 * @param {String} option.exclusiveBottomClassName 独占的底部样式
	 * @param {String} option.exclusiveClassName 独占的container样式
	 * @param {String} option.className 容器样式
	 * @param {String} option.topClassName 顶部样式
	 * @param {String} option.bottomClassName 底部样式
	 * @param {String} option.switchMode 切换样式 ['fadein','slideleft','slideright','none']
	 */
	pageManager.html = function(option){
		var self = this;
		var $cloneWrapper = this.pageWrapper;
		if(option.switchMode || config.switchMode){
			$cloneWrapper = this.pageWrapper.clone();
		}
		
		this.top = $cloneWrapper.find(config.top);
		this.bottom = $cloneWrapper.find(config.bottom);
		this.container = this.classWrapper = $cloneWrapper.find(config.container);
		
		if(option.top !== undefined){
			var defaultTopClass = config.defaultTopClass,
				topClassWrapper = (defaultTopClass||'') +' '+ (option.topClassName||'');

			this.top.attr('class',option.exclusiveTopClassName || topClassWrapper);
        	this.top.html(option.top);
        }
        if(option.bottom  !== undefined){
        	var defaultBottomClass = config.defaultBottomClass,
				bottomClassWrapper = (defaultBottomClass||'') +' '+ (option.bottomClassName||'');

			this.bottom.attr('class',option.exclusiveBottomClassName || bottomClassWrapper);
        	this.bottom.html(option.bottom);
        }

        var method = pageManager.pageswitcher.method[option.switchMode || config.switchMode];

        //container
        if(option.container  !== undefined ){
        	this.container.html(option.container);
        }

        //滚动逻辑
        
		setTimeout(function(){
			var defaultClass = config.defaultClass,
				classWrapper = pageManager.classWrapper,
				className = (defaultClass || '') +' ' +(option.className||'');

			classWrapper.attr('class', option.exclusiveClassName || className);
		},0);
		if(option.scroll !== undefined){
    		this.container.scrollTop(option.scroll || 0);
    	}

        if(method && $cloneWrapper){
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

        //安卓3以下的版本模拟滚动
        if(/android\s*2/i.test(window.navigator.userAgent)){
            util.emulateScroll(pageManager.container);
        }
	};

	var parentInit = pageManager.init;

	pageManager.init = function(){
		parentInit.call(this);
		this.top = $(config.top);
        this.bottom = $(config.bottom);
        this.mask = $(config.mask);
        this.dialog = $(config.dialog);
        this.msgbox = $(config.msgbox);
	};

	module.exports = pageManager;
});