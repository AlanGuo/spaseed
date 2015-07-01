define('mp.View',function(require, exports, module){

	var Node = require('node');
	var template = require('template');

	
	var View = Node.extend({
		_:'',
		title:'',
		template:'',
		elements:{},
		ctor:function(data){
			this.$super(data);
		},
		render:function(){
			if(this.template){
				this.$.innerHTML = template(this.template,{});
			}
			return this;
		},
		reload:function(){

		},
		slidein:function(effect,callback){
			var element = this.$;
			var map = {left:['translate3d(0, 0, 0)',2],right:['translate3d(0, 0, 0)',1]};
			if(effect){
				element.style.zIndex = map[effect][1];
				element.clientHeight;
				element.style.WebkitTransform = map[effect][0];
				setTimeout(callback.bind(this),500);
			}	
			else{
				callback.call(this);
			}	
		},
		slideout:function(effect,callback){

			var element = this.$;
			var map = {left:['translate3d(-20%, 0, 0)',1],right:['translate3d(100%, 0, 0)',2]};
			if(effect){
				element.style.zIndex = map[effect][1];
				element.style.WebkitTransform = map[effect][0];
				setTimeout(callback.bind(this),500);
			}	
			else{
				callback.call(this);
			}
		},
		input:function () {
			var selects = Array.prototype.slice.call(this.$.getElementsByTagName('select'));
			var inputs = Array.prototype.slice.call(this.$.getElementsByTagName('input')).concat(selects);

			var obj = {};

			inputs.forEach(function (item) {
				obj[item.name] = item.value; 
			})

			return obj;
		},
		destroy:function(){
			this.off();
		}
	})

	module.exports = View;
})
