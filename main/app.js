'use strict';

define(function(require, exports, module){
	var mp = require('mp');
	//route parse
	function parse(url,option){

		var atag,pathname,seach,params = {},view,arr;

		atag = document.createElement('a');
		atag.href = url;

		pathname = atag.pathname;
		seach = atag.search.substr(1);

		if(pathname == '/'){
			pathname = this.config.root || '/index';
		}

		view = 'views'+pathname;

		view = view.split('/').join('.')

		view = view.replace(/\.(\w)(\w*)$/,function(all,match,next){
			return '.'+match.toUpperCase()+next;
		});

		for(var p in option){
			params[p] = option[p];
		}
		arr = seach.split('&')
		arr.forEach(function(item){
			pair = item.split('=')
			if(pair[0]){
				params[pair[0]] = pair[1]
			}
		})

		return {
			pathname:pathname,
			view:view,
			params:params,
			template:pathname.substr(1)
		}

	}

	var App = mp.Class.extend({
		view:null,
		cache:{},
		history:[],
		historyIndex:0,
		config:{root:'/index'},
		ctor:function(data){
			this.$super(data);
			window.addEventListener('popstate',function(e){
				if(e.state){
					if(e.state.url){
						
						if(e.state.historyIndex < this.historyIndex){
							this.backView()
						}
						else{
							e.state.option.browser = true;
							this.loadUrl(e.state.url,e.state.option);
						}
						
					}
				}
			}.bind(this));

			this.click('router',function(target,dataset){
				this.loadUrl(target.getAttribute('router'),dataset)
			})
		},
		loadUrl:function(url,option,cacheHtml,effect){
			//数据校验
			if(!url){
				this.loadUrl(this.config.root,option,cacheHtml,effect);
				return;
			}
			if(!option){
				option = {}
			}

			if(cacheHtml){
				option.cacheHtml = cacheHtml;
			}

			if(effect){
				option.effect = effect;
			}

			var obj = parse.call(this,url,option),view;

			//当前view修改参数，不重新渲染，执行view的reload方法
			//_ 记录了当前view的id
			if(this.view && this.view._ === obj.view){
				view = this.view;
				view.params = obj.params;
				view.reload();
	
			}
			//否则重新构建view
			else{
				var View = require(obj.view);
				var map = {
					left:'translate3d(100%, 0, 0)',
					right:'translate3d(-20%, 0, 0)'
				}
				if(View){ 
					view = new View({
						style:{
							WebkitTransition:'-webkit-transform .4s',
							WebkitTransform:map[option.effect],
							position:'absolute',
							top:0,
							right:0,
							bottom:0,
							left:0
						}
					});

					view._ = obj.view;

					view.params = obj.params;
					this.loadView(view);
				}
			}	

			this.history.push([url,option,view.$.innerHTML]);
			if(this.history.length > 10){
				this.history = this.history.slice(5);
			}

			this.historyIndex++

			if(!option.browser){
				history.pushState({url:url,option:option,historyIndex:this.historyIndex},view.title,url);
			}
			
		},
		addChild:function(view){
			this.$super(view);
			this.view = view;
		},
		loadView:function(view){
			var effect = view.params.effect;
			if(this.view){
				(function(){
					var last = this.view;
					last.slideout(effect,function(){
						last.destroy()
						this.removeChild(last);
					}.bind(this))
				}.bind(this))();
			}
			
			this.addChild(view);

			this.view.slidein(effect,function(){});
			this.view.render();
			document.title = this.view.title;
		},
		backView:function(){
			this.history.pop();

			var record = this.history.pop() || ['','',''];
			record.push('right');

			this.loadUrl.apply(this,record);
		},
		startup:function(option){
			for(var p in option){
				this.config[p] = option[p];
			}
			this.loadUrl(window.location.href)
		}
	})

	App.create = function(data){
		return new App(data);
	}

	module.exports = App;
})
