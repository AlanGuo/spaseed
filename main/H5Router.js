'use strict';

define(function(require, exports, module){
	var $ = require('$'),
		mp = require('mp');

	var Router = mp.Class.extend({
		history:[],
		historyIndex:0,
		ctor:function(app){
			this.$app = app;
		},

		init:function(){
			var self = this;
			window.addEventListener('popstate',function(e){
				if(e.state){
					if(e.state.url){
						if(e.state.historyIndex && e.state.historyIndex < self.historyIndex){
							//控制app跳转
							self.backView();
						}
						else{
							e.state.option.browser = true;
							//控制app跳转
							self.loadUrl(e.state.url,e.state.option);
						}
						
					}
				}
			});
		},

		loadUrl:function(url,option,cacheHtml,effect){
			//数据校验
			if(!url){
				this.loadUrl(this.$app.config.root,option,cacheHtml,effect);
				return;
			}
			//配置
			if(!option){
				option = {};
			}

			if(cacheHtml){
				option.cacheHtml = cacheHtml;
			}

			if(effect){
				option.effect = effect;
			}

			var obj = this.parse.call(this,url,option),view;

			//当前view修改参数，不重新渲染，执行view的reload方法
			//_ 记录了当前view的id
			if(this.$app.view && this.$app.view._ === obj.view){
				view = this.$app.view;
				view.params = obj.params;
				view.reload();
			}
			//否则重新构建view
			else{
				var self = this;
				require.async(obj.view,function(View){
					if(View){ 
						view = new View(self.$app);

						view._ = obj.view;

						view.params = obj.params;
						self.$app.loadView(view);
					}
					self.push(url,option,view);				
				});
			}
		},

		backView:function(record){
			var record = this.pop();
			if(record){
				this.loadUrl.apply(this,record);
			}
		},

		parse:function(url, option){
			var atag,pathname,search,params = {},view,arr,pair,filename;
			atag = document.createElement('a');
			atag.href = url;

			pathname = atag.pathname;
			search = atag.search.substr(1);

			if(pathname == '/'){
				pathname = this.$app.config.root || '/index';
			}

			//文件名和最后一个文件夹相同
			filename = pathname.split('/').slice(-1);
			view = this.$app.config.viewfolder + pathname + '/' + filename;

			for(var p in option){
				params[p] = option[p];
			}
			arr = search.split('&')
			arr.forEach(function(item){
				pair = item.split('=')
				if(pair[0]){
					params[pair[0]] = pair[1]
				}
			});

			return {
				pathname:pathname,
				view:view,
				params:params,
				template:pathname.substr(1)
			};
		},
		push:function(url,option,view){
			this.history.push([url,option,view.$elem.html()]);
			if(this.history.length > 10){
				this.history = this.history.slice(5);
			}
			this.historyIndex++;

			if(!option.browser){
				history.pushState({url:url,option:option,historyIndex:self.historyIndex},view.title,url);
			}

		},
		pop:function(){
			this.history.pop();

			var record = this.history.pop() || ['','',''];
			record.push('right');

			return record;
		},
		startup:function(){
			this.loadUrl(window.location.href);
		}
	});

	Router.create = function(app){
		return new Router(app);
	}

	module.exports = Router;
})
