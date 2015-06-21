/**
 * @module binder
 * 绑定模块，提供双向绑定功能
 */

'use strict';

define(function(require, exports, module) {
	var selectors = '[bind-content],[bind-value],[bind-attr]';

	var binders = {
		value:function(node, onchange) {
	        node.addEventListener('keyup', function() {
	            onchange(node.value);
	        });
	        return {
	            updateProperty: function(value) {
	                if (value !== node.value) {
	                    node.value = value;
	                }
	            }
	        };
	    },
	    content: function(node) {
	        return {
	            updateProperty: function(value) {
	                node.textContent = value;
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
	            updateProperty: function(value,attrname) {
	                node.setAttribute(attrname, value);
	            }
	        };
	    }
	};

	var bindEngine = {
		bind:function(container, object){
			function getDirectObject(object, propertyName){
				var val = object;
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
			function bindObject(node, binderName, object, propertyName) {
				//绑定属性
				var observer = null;
				var bindProperty = function(bnName, propObj){
					var prop = propObj.prop,
						attr = propObj.attr;

					var dobject = getDirectObject(object,prop),
					dproperty = prop.split('.').slice(-1)[0];

			        var updateValue = function(newValue) {
			            dobject[dproperty] = newValue;
			        };
			        var binder = binders[bnName](node, updateValue, object, attr);
			        binder.updateProperty(dobject[dproperty],attr);

			        return {
			        	dobject:dobject,
			        	dproperty:dproperty,
			        	binder:binder,
			        	attribute:attr
			        };
				};

				var objArray = [];
				for(var i=0;i<binderName.length;i++){
					objArray.push(bindProperty(binderName[i], propertyName[i]));
				}
				observer = function(changes) {
					var index =null; 
		            var changed = changes.some(function(change) {
		            	return objArray.filter(function(item,i){
		            		if(change.name === item.dproperty && 
		            			change.object === item.dobject){
		            			
		            			index = i;
		            			return item;
		            		};
		            	}).length;
		            });
		            if (changed && objArray!=null) {
		            	var obj = objArray[index];
		                obj.binder.updateProperty(obj.dobject[obj.dproperty],obj.attribute);
		            }
		        };

				Object.observe(object, observer);

		        return {
		            unobserve: function() {
		                Object.unobserve(object, observer);
		            }
		        };
		    }

		    function bindCollection(node, array) {
		    	//捕捉自己并且把自己删除
		        function capture(original) {
		            var before = original.previousSibling;
		            var parent = original.parentNode;
		            var node = original.cloneNode(true);
		            original.parentNode.removeChild(original);
		            return {
		                insert: function() {
		                    var newNode = node.cloneNode(true);
		                    parent.insertBefore(newNode, before);
		                    return newNode;
		                }
		            };
		        }

		        delete node.dataset.repeat;
		        var parent = node.parentNode;
		        var captured = capture(node);
		        var bindItem = function(element) {
		        	//为每一个repeat元素设置绑定
		            return bindModel(captured.insert(), element);
		        };
		        //根据array生成bindings
		        var bindings = array.map(bindItem);
		        var observer = function(changes) {
		            changes.forEach(function(change) {
		                var index = parseInt(change.name, 10), child;
		                if (isNaN(index)) return;
		                if (change.type === 'add') {
		                    bindings.push(bindItem(array[index]));
		                } else if (change.type === 'update') {
		                    bindings[index].unobserve();
		                    bindModel(parent.children[index], array[index]);
		                } else if (change.type === 'delete') {
		                    bindings.pop().unobserve();
		                    child = parent.children[index];
		                    child.parentNode.removeChild(child);
		                }
		            });
		        };
		        //observe array
		        Object.observe(array, observer);
		        return {
		            unobserve: function() {
		                Object.unobserve(array, observer);
		            }
		        };
		    }

			//是不是被repeat包裹的元素，是,返回false
			function isDirectNested(node) {
	            node = node.parentElement;
	            while (node) {
	                if (node.dataset.repeat) {
	                    return false;
	                }
	                node = node.parentElement;
	            }
	            return true;
	        }

	        //返回没有被repeat包裹的元素
	        function onlyDirectNested(selector) {
	            var collection = container.querySelectorAll(selector);
	            return Array.prototype.filter.call(collection, isDirectNested);
	        }

	        var bindings = onlyDirectNested(selectors).map(function(node) {
	        	var bindType = [],
	        		propertyName = [],
	        		attributeName;
	        	if(node.getAttribute('bind-value')){
	        		bindType.push('value');
	        		propertyName.push({prop:node.getAttribute('bind-value')});
	        	}
	        	if(node.getAttribute('bind-content')){
	        		bindType.push('content');
	        		propertyName.push({prop:node.getAttribute('bind-content')});
	        	}
	        	if(node.getAttribute('bind-attr')){
	        		var keyvalArray = node.getAttribute('bind-attr').split(',');
	        		
	        		for(var i=0;i<keyvalArray.length;i++){
        				var keyval = keyvalArray[i].split('=');
        				bindType.push('attribute');
        				propertyName.push({prop:keyval[1],attr:keyval[0]});
	        		}
	        	}
	        	return bindObject(node, bindType, object, propertyName);

		    }).concat(onlyDirectNested('[data-repeat]').map(function(node) {
		    	return bindCollection(node, object[node.dataset.repeat]);
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
});