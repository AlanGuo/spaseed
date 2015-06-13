/**
 * @module binder
 * 绑定模块，提供双向绑定功能
 */

'use strict';

define(function(require, exports, module) {
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
	    }
	};

	var bindEngine = {

		bind:function(container, object){
			function bindObject(node, binderName, object, propertyName) {
		        var updateValue = function(newValue) {
		            object[propertyName] = newValue;
		        };
		        var binder = binders[binderName](node, updateValue, object);
		        binder.updateProperty(object[propertyName]);
		        var observer = function(changes) {
		            var changed = changes.some(function(change) {
		                return change.name === propertyName;
		            });
		            if (changed) {
		                binder.updateProperty(object[propertyName]);
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

	        var bindings = onlyDirectNested('[data-bind],[data-model]').map(function(node) {
	        	var bindType = '',
	        		propertyName = '';
	        	if(node.dataset.model){
	        		bindType = 'value';
	        		propertyName = node.dataset.model;
	        	}
	        	else if(node.dataset.bind){
	        		bindType = 'content';
	        		propertyName = node.dataset.bind;
	        	}
	        	
	        	var parts = node.dataset.bind;
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