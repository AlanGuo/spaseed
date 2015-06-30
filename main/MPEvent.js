define('mp.Event',function(require, exports, module){

	var mp = require('mp');

	var mpNodes = [];

	var Event = mp.Class.extend({	
		ctor:function(mpNode){

			mpNodes.push(mpNode);

			var self = this;
			var handlers = {};
			var element = mpNode.$;
			var clicks = {};
			var scrolls = {};

			var callback = function(e,$e){

				var type = e.type;
				var dataTransfer = e.dataTransfer;

				if(type == 'touchend'){
					type = 'click'
				}

				if($e){
					e = $e;
				}

				if(handlers[type] && handlers[type].length){
					var prevent = false;
					handlers[type].forEach(function(hdl){
						if(false === hdl.call(mpNode,e,e.target,dataTransfer)){
							prevent = true;
						}
					})
					
					if(prevent && e.preventDefault){
						e.preventDefault();
                    	e.stopPropagation();
					}
				}
			}
			this.scroll = function(name,hdl){

				var name,activeNode;

				this.on('scroll',function(e,target,data){

					if(activeNode){

						scrolls[name].call(this,activeNode,data);

						if(data.end){
							name = '';
							activeNode = null;
						}

						return false;
					}
					else{
						while(target && target.nodeType == 1){

							name = target.dataset.scroll;
							if(name && scrolls[name]){

								activeNode = target;

								scrolls[name].call(this,activeNode,data);
								break;
							}

							target = target.parentNode;
						}
						if(activeNode){
							return false;
						}
					}
					
				})

				this.scroll = function(name,hdl){
					scrolls[name] = hdl;
				}
				this.scroll(name,hdl);

			}
			this.click = function(name,hdl){

				this.on('click',function(e,target){

					while(target && target.nodeType == 1){
						var name = target.dataset.click,dataset = {};
						if(name && clicks[name]){

							for(var p in target.dataset){
								dataset[p] = target.dataset[p];
							}

							return clicks[name].call(this,target,dataset);
							break;
						}

						target = target.parentNode;
					}
				})

				this.click = function(name,hdl){

					clicks[name] = hdl;
				}
				this.click(name,hdl);
			}
			this.on = function(types,hdl){

				types = types.split(',');
				types.forEach(function(type){
					//第一次添加该类型则:
					//1
					if(!handlers[type]){
						handlers[type] = [];
					}
					//2
					if(handlers[type].length < 1){

						if ('ontouchstart' in element) {

							(function(){

								var x1=0,y1=0,x2=0,y2=0,flag = false,offsetX,offsetY,tg,scroll,direction;
								element.addEventListener('touchstart',function(e){

									var touch = e.touches[0];
									x1 = touch.pageX;
									y1 = touch.pageY;
									offsetX = 0;
									offsetY = 0;

									flag = false;
									scroll = false;
									direction = false

								})
								element.addEventListener('touchmove',function(e){
									
									var touch = e.touches[0];
									x2 = touch.pageX;
									y2 = touch.pageY;
									offsetX = x2-x1;
									offsetY = y2-y1;
									tg = Math.abs(offsetY/offsetX);	

									if(Math.abs(offsetX) > 3 && tg < 1){

										if(offsetX < 0){
											direction = 'left'
											
										}
										else if(offsetX > 0){
											direction = 'right'
										}
										this.emit('scroll',e,{offsetX:offsetX,direction:direction});
										scroll = true;
									}

									flag = true;
								}.bind(this))
								element.addEventListener('touchend',function(e){
									if(flag){
										if (scroll) {
											this.emit('scroll',e,{offsetX:offsetX,end:true,direction:direction});
										}
										else if(Math.sqrt(Math.pow(offsetX,2) + Math.pow(offsetY,2)) < 3){
											this.emit('click',e);
										}
									}
									else{
										callback(e)
									}
									
								}.bind(this))
							}.bind(this))()
						} 
						else if('on'+type in element){
							element.addEventListener(type,callback);
						}
					}

					handlers[type].push(hdl);
				}.bind(this))	

				return mpNode;
			}
			this.off = function(type,types){
				if(type){
					types = [type];
				}
				else{
					types = Object.keys(handlers);
				}

				types.forEach(function(type){
					if(handlers[type]){
						if(element['on'+type] !== undefined){
							element.removeEventListener(type,callback);
						}
						handlers[type] = undefined;
					}
				})
				
				mpNodes = mpNodes.filter(function(item){
					return item !== mpNode;
				})

				return mpNode;
			}
			this.emit = function(type,$e,data){

				callback({type:type,dataTransfer:data},$e)

				return mpNode;
			}
		}
	});

	Event.create = function(mpNode){
		return new Event(mpNode);
	}

	module.exports = Event;
})


