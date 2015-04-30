'use strict';

/**
 * @dialog 模块
 * dialog.show(template,{
		header:true,
		buttons:[{
			name:'确定',
			dataEvent:'closeDialog'
		}]
 * });
 * 一个带通用头部和底部确定按钮的对话框
 * dialog.show(template)
 * 一个完全自定义的对话框
 * dialog.alert('文本');
 * 一个标准的提示对话框
 *
 * 目前只支持两个按钮
 */
 
define(function(require, exports,module) {

	var $ = require('$');
	
	var pageManager = require('pagemanager');
    var evt = require('event');
    var template = require('template');
    var env = require('env');

    var dialog = {status:0,height:0};

    dialog.alert = function(text,option){
    	option = option || {};
    	option.zIndex = option.zIndex || 5;
    	option.header = option.header === true ? true:false;
    	option.buttons = option.buttons || [{
    		name:'确定'
    	}];
    	this._setTemplate(template('common/dialog/dialog',{
    		text:text,
    		option:option
    	}),option);

    	if(option.buttons){
    		this._addButton(option);
    	}
    	this.showMask();
    	this.status = 1;
    };
	dialog.show = function(html,option){
		option = option || {};
		option.zIndex = option.zIndex || 5;
		
		if(html){
			//更新模板，显示对话框
			this._setTemplate(template('common/dialog/dialog',{
				'html':html,
				option:option
			}),option);
		}
		else{
			//直接系那是对话框
			this._showTemplate();
		}

		//底部按钮
		if(option.buttons){
			//删除之前的按钮
			pageManager.dialog.find('.bottom-button').remove();
			this._addButton(option);
		}
		
		this.showMask();

		var inputs = $(pageManager.dialog).find('input');
		if(inputs.length){
			if(!inputs.prop('readonly') && !inputs.prop('disabled')){
				if(env.isAndroid){
					setTimeout(function(){
						inputs[0].focus();
					}, 200);
				}
				else{
					inputs[0].focus();
				}
				
			}
		}
		//监听resize事件做处理
		window.onresize = function(){
			if($(window).height()<dialog.height){
				pageManager.dialog.css('height','100%');
			}
			else{
				pageManager.dialog.css('height','auto');
			}
        };

		this.status = 1;
	};
	dialog._addButton = function(option){
		//底部按钮
		if(option.buttons){
			var buttonPanel = document.createElement('div');
			$(buttonPanel).html(template('common/buttombutton/buttons',{buttons:option.buttons}));
			
			this.bottomButtons = $(buttonPanel).children();
			this.bottomButtons.css('z-index',option.zIndex+1);

			pageManager.dialog.append(this.bottomButtons);
		}
	};
	dialog._removeButton = function(){
		//底部按钮
		if(this.bottomButtons){
			this.bottomButtons.remove();
		}
	};
	dialog._setTemplate = function(html){
		var height = pageManager.dialog.html(html).show().height();
		pageManager.dialog.css('bottom',-height+'px');
		pageManager.dialog[0].clientHeight = pageManager.dialog[0].clientHeight;
		pageManager.dialog.css('bottom',0);

		this.height = height;
	};
	dialog._showTemplate =function(){
		pageManager.dialog.show().css('bottom',-pageManager.dialog.height()+'px');
		pageManager.dialog[0].clientHeight = pageManager.dialog[0].clientHeight;
		pageManager.dialog.css('bottom',0);
	};
	dialog.hide = function(){
		this.hideMask();
		pageManager.dialog.css('bottom',-pageManager.dialog.height()+'px');
		//底部按钮的样式
		//pageManager.dialog.find('.bottom-button').css('position','absolute');
		setTimeout(function(){
			pageManager.dialog.hide();
		}, 200);
		//this._removeButton();
		this.status = 0;

		document.activeElement.blur();
	};
	dialog.showError = function(msg){
		var container = document;
		if(this.status){
			container = pageManager.dialog;
		}
		var errorEl = $(container).find('div[data-error]');
		errorEl.html(msg).removeClass('fade-out').show();
		setTimeout(function(){
			errorEl.addClass('fade-out');
			setTimeout(function(){
				errorEl.hide();
			},200);
		},2000);
	};
	dialog.wxshare = function(){
		var helper = $('<div class="popup-wxshare"><span class="share-wx">点击右上角，分享到朋友圈</span><a class="icon-close"> 点击关闭</a></div>');
		this.showMask();
		helper.appendTo('body');

		var close = function(){
			dialog.hideMask();
			helper.remove();
			helper = undefined;
		};
		helper.on('touchstart',close);
		setTimeout(function(){
			if(helper){
				close();
			}
		},5000);
	};
	dialog.wxopeninbrowser = function(){
		var helper = $('<div class="popup-wxshare"><span class="pay-wx">点击右上角，用浏览器打开再支付</span><a class="icon-close"> 点击关闭</a></div>');
		this.showMask();
		helper.appendTo('body');

		var close = function(){
			dialog.hideMask();
			helper.remove();
			helper = undefined;
		};
		helper.on('touchstart',close);
		setTimeout(function(){
			if(helper){
				close();
			}
		},5000);
	};
	dialog.getParams = function(){
		var params = {};
		$(pageManager.dialog).find('input').each(function(){
			params[this.name] = this.value;
		});
		return params;
	};
	dialog.msgbox = function(msg,ms){
		pageManager.msgbox.removeClass('fade-out').html('<p>'+msg+'</p>').show();
		setTimeout(function(){
			pageManager.msgbox.addClass('fade-out');
			setTimeout(function(){
				pageManager.msgbox.hide();
			},500);
		},ms||2000);
	};
	dialog.showMask = function(){
		pageManager.mask.css('height',env.resolution.y).show();
	};
	dialog.hideMask = function(){
		pageManager.mask.hide();
	};
	evt.addCommonEvent('click',{
		'dialog-hide':function(){
			dialog.hide();
		}
	});

    module.exports = dialog;
});