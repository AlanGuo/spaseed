/**
 * @module binder
 * 绑定模块，提供双向绑定功能
 */
var selectors = '[bind-content],[bind-value],[bind-file],[bind-attr]';

var binders = {
	value:function(node, onchange) {
		if(onchange){
			if(/input/i.test(node.tagName)){
		        node.addEventListener('keyup', function() {
		            onchange(node.value);
		        });
		    }
		    else if(/select/i.test(node.tagName)){
		    	node.addEventListener('change',function(){
		    		onchange(node.value);
		    	});
		    }
	    }
        return {
            updateProperty: function(value) {
                if (value !== node.value) {
                    node.value = value;
                }
            }
        };
    },
    file:function(node, onchange){
    	if(onchange){
	        node.addEventListener('change', function() {
	            onchange(node.files);
	        });
	    }
        return {
            updateProperty: function(value) {
                if (value !== node.files) {
                    node.files = value;
                }
            }
        };
    },
    content: function(node) {
        return {
            updateProperty: function(value) {
                node.innerText = value;
            }
        };
    },
    click: function(node, onchange, object) {
        var previous;
        return {
            updateProperty: function(fn) {
                var listener = function(e) {
                    fn.apply(object, arguments);
                    e.preventDefault();
                };
                if (previous) {
                    node.removeEventListener(previous);
                    previous = listener;
                }
                node.addEventListener('click', listener);
            }
        };
    },
    attribute: function(node, onchange, object, attrname){
    	return {
            updateProperty: function(expr, attrname){
            	node.setAttribute(attrname,expr);
            }
        };
    }
};

var bindEngine = {
	bind:function(container, object){
		function getDirectObject(object, property){
			var getdo = function(object, propertyName){
				var val = object;
				//properties是对象
				if(/\./.test(propertyName)){
					var pnamearray = propertyName.split('.');
					for(var i=0;i<pnamearray.length-1;i++){
						if(val){
							val = val[pnamearray[i]];
						}
						else{
							break;
						}
					}
					return val;
				}
				else{
					return object;
				}
			}
			return getdo(object, property);
		}

		function parseExpr(expr, object){
			//{}大括号内的表示需要eval运算的
			var props = expr.match(/\{.*?\}/g),
				isexpr = false,
				objectRoutes = [],
				dobjects = [],
				dproperties = [];

			if(props){
				for(var i=0;i<props.length;i++){
					props[i] = props[i].replace(/\{|\}/g,'');
					expr = expr.replace(new RegExp('\\{'+props[i]+'\\}','g'), props[i]);
					dobjects.push(getDirectObject(object,props[i]));
					dproperties.push(props[i].split('.').slice(-1)[0]);

					//objectRoutes
					var obj = object;
					props[i].split('.').map(function(prop){
						objectRoutes.push({
							obj:obj,
							prop:prop
						});
						obj = obj[prop];
					});
				}
				isexpr = true;
			}
			if(!isexpr){
				dobjects.push(getDirectObject(object,expr));
				dproperties.push(expr.split('.').slice(-1)[0]);

				//objectRoutes
				var obj = object;
				expr.split('.').map(function(prop){
					objectRoutes.push({
						obj:obj,
						prop:prop
					});
					obj = obj[prop];
				});
			}

			return {
				dobjects:dobjects,
				objectRoutes:objectRoutes,
				dproperties:dproperties,
				isexpr:isexpr,
				getValue:function(obj){
					if(isexpr){
						with(obj || object){
							return eval(expr);
						}
					}
					else{
						return dobjects[0][dproperties[0]];
					}
				}
			};
		}

		function bindObject(node, binderName, object, propertyName) {
			var objArray = [],
				unobserveArray = [];
			//绑定属性
			var bindProperty = function(bnName, propObj){
				var expr = propObj.expr,
					attr = propObj.attr;

				//从表达式中抓去属性值
				var parsedObj = parseExpr(expr, object);
				
				//控件值改变了更新对象
		        var updateValue = parsedObj.isexpr?null:function(newValue) {
		            parsedObj.dobjects[0][parsedObj.dproperties[0]] = newValue;
		        };

		        var binder = binders[bnName](node, updateValue, object, attr);
		        binder.updateProperty(parsedObj.getValue(),attr);

		        return {
		        	parsedObj:parsedObj,
		        	binder:binder,
		        	attribute:attr
		        };
			};

			//可能存在多组属性需要绑定
			for(var i=0;i<binderName.length;i++){
				objArray.push(bindProperty(binderName[i], propertyName[i]));
			}
			var observeUpdate = function(changes, dobject, dproperty, item) {
	            var changed = changes.some(function(change) {
            		if(dproperty == change.name  && 
            			change.object == dobject){
            			return true;
            		};
	            });
	            if (changed) {
	                item.binder.updateProperty(item.parsedObj.getValue(),item.attribute);
	            }
	            return item;
	        };

	        //数组observer
	        objArray.map(function(objArrayItem,objArrayIndex){
	        	(function(item,index){
		        	//相关的对象变更，也会反映在更新上
	        		item.parsedObj.objectRoutes.forEach(function(routeItem,routeIndex){
	        			Object.observe(routeItem.obj, function(changes){
	        				//为了更新变化的对象, 必须找出变更对象的父对象名称
	        				var parentObject = item.parsedObj.objectRoutes[routeIndex-1];
	        				//更新item值
	        				if(parentObject){
	        					parentObject.obj = changes[0].object;
	        				}
	        				else{
	        					object = changes[0].object;
	        				}
	        				
	        				objArray[index] = item = bindProperty(binderName[index], propertyName[index]);
	        				observeUpdate(changes, routeItem.obj, routeItem.prop , item);
	        			});
	        		});
	        	})(objArrayItem,objArrayIndex);
	        });

	        return {
	            unobserve: function() {
	            	unobserveArray.map(function(item){
	            		Object.unobserve(item.object, item.func);
	            	});
	            }
	        };
	    }

	    function bindCollection(node, array, object, parent) {
	    	array = array || [];
	    	var newNodeCollection = [];
	    	//捕捉自己并且把自己删除
	        function capture(original) {
	            var node = original.cloneNode(true);
	            if(Array.prototype.slice.call(parent.children).indexOf(original)>-1){
	            	parent.removeChild(original);
	            }
	            return {
	                insert: function() {
	                    var newNode = node.cloneNode(true);
	                    newNodeCollection.push(newNode);
	                    parent.appendChild(newNode);
	                    return newNode;
	                }
	            };
	        }

	        node.removeAttribute('bind-repeat');

	        parent = parent || node.parentNode;
	        var captured = capture(node);
	        var bindItem = function(obj) {
	        	//为每一个repeat元素设置绑定
	        	var elem = captured.insert()
	        	elem.style.display = '';
	            return bindEngine.bind(elem, obj);
	        };
	        //根据array生成bindings
	        var bindings = array.map(bindItem);


	        var arrObserver = function(changes) {
	            changes.forEach(function(change) {
	                var index = parseInt(change.name, 10), child;
	                if (isNaN(index)) return;
	                if (change.type === 'add') {
	                    bindings.push(bindItem(array[index]));
	                } else if (change.type === 'update') {
	                    bindings[index].unobserve();
	                    bindEngine.bind(parent.children[index], array[index]);
	                } else if (change.type === 'delete') {
	                    bindings.pop().unobserve();
	                    child = parent.children[index];
	                    child.parentNode.removeChild(child);
	                }
	            });
	        };

	        //observe array
	        Object.observe(array, arrObserver);

	        return {
	            unobserve: function() {
	                Object.unobserve(array, arrObserver);
	            },
	            newNodeCollection:newNodeCollection
	        };
	    }

		//是不是被repeat包裹的元素，是,返回false
		function isDirectNested(node) {
            node = node.parentElement;
            while (node) {
                if (node.getAttribute('bind-repeat')) {
                    return false;
                }
                node = node.parentElement;
            }
            return true;
        }

        //返回没有被repeat包裹的元素
        function onlyDirectNested(selector) {
        	if(container.length) {container = container[0];}
            var collection = container.querySelectorAll(selector);
            return Array.prototype.filter.call(collection, isDirectNested);
        }

        var bindings = onlyDirectNested(selectors).map(function(node) {
        	var bindType = [],
        		propertyName = [],
        		attributeName;

        	if(node.getAttribute('bind-value')){
        		bindType.push('value');
        		propertyName.push({expr:node.getAttribute('bind-value')});
        	}
        	if(node.getAttribute('bind-file')){
        		bindType.push('file');
        		propertyName.push({expr:node.getAttribute('bind-file')});
        	}
        	if(node.getAttribute('bind-content')){
        		bindType.push('content');
        		propertyName.push({expr:node.getAttribute('bind-content')});
        	}
        	if(node.getAttribute('bind-attr')){
        		var keyvalArray = node.getAttribute('bind-attr').split(',');
        		for(var i=0;i<keyvalArray.length;i++){
    				var keyval = /(.*?)=(.*)/.exec(keyvalArray[i]);
    				bindType.push('attribute');
    				propertyName.push({expr:keyval[2],attr:keyval[1]});
        		}
        	}
        	return bindObject(node, bindType, object, propertyName);

	    }).concat(onlyDirectNested('[bind-repeat]').map(function(node) {

	    	var arrayName = node.getAttribute('bind-repeat'),
	    		parent = node.parentNode,
	        	isexpr = false,
	        	collectionBinder,
	        	unobserveArray = [];

	        var parsedObj = parseExpr(arrayName,object);

	    	//绑定object
	    	var objObserver = function(changes, dproperty, dobject) {
	            var changed = changes.some(function(change) {
            		if(dproperty == change.name && change.object === dobject){
            			return true;
            		}
	            });
	            if (changed) {
	            	collectionBinder.newNodeCollection.map(function(item){
	            		parent.removeChild(item);
	            	});
	            	collectionBinder = bindCollection(node, parsedObj.getValue(), object, parent);
	            }
	        };
	        
	        collectionBinder = bindCollection(node, parsedObj.getValue(), object, parent);

	        parsedObj.dobjects.map(function(dobject,index){
	        	var func = function(changes){
	        		objObserver(changes, parsedObj.dproperties[index], dobject);
	        	};
	        	unobserveArray.push({object:dobject,func:func});
	        	Object.observe(dobject, func);
	        });	

	    	return {
	    		unobserve:function(){
	    			unobserveArray.map(function(item){
	    				Object.unobserve(item.object, item.func);
	    			});
	    			collectionBinder.unobserve();
	    		}
	    	}
	    }));
        return {
            unobserve: function() {
                bindings.forEach(function(binding) {
                    binding.unobserve();
                });
            }
        };
	}
};

module.exports = bindEngine;