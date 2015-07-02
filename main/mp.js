'use strict';

define(function(require, exports, module){

	var $id = (0|(Math.random()*998));

	var mp = {};
	/**
	 *@class mp.Class
	 */
	mp.Class = function(){
	}
	/**
	 *@method mp.Class.extend
	 *@param prop {Object} 原型
	 *@static
	 *@example
	 	var app = mm.Class.extend(prop)
	 */
	mp.Class.extend = function(prop){

		function Class(){

			var index = 0;

			this.$id = ++$id;

			//执行构造方法
			if(this.ctor){
				this.ctor.apply(this,arguments);
			}
		}

		var $super = this.prototype;
		var prototype = Object.create($super);
		var $superTest = /\.\$super\b/;

		Class.prototype = prototype;

		var description = { writable: true, enumerable: false, configurable: true };

		for(var name in prop){
			var isFunc = (typeof prop[name] === "function");
            var override = (typeof $super[name] === "function");
            var hasSuperCall = $superTest.test(prop[name]);

            if (isFunc && override && hasSuperCall) {

                description.value = (function (name, fn) {
                    return function () {
                        var tmp = this.$super;
                        this.$super = $super[name];

                        var result = fn.apply(this, arguments);
                        this.$super = tmp;

                        return result;
                    };
                })(name, prop[name]);

                Object.defineProperty(prototype, name, description);

            } else if (isFunc) {
                description.value = prop[name];
                Object.defineProperty(prototype, name, description);
            } else {
                prototype[name] = prop[name];
            }

		}

		Class.extend = mp.Class.extend;

		return Class;
	}

	module.exports = mp;
})
