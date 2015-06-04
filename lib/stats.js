define(function(){
	var stats = {
		/**
		 * 统计事件（点击）
		 * @method trackEvent
		 * @param  {string} category 事件类别，必填项，表示事件发生在谁身上，如“视频”、“小说”、“轮显层”等等。
		 * @param  {string} action 事件操作，必填项，表示访客跟元素交互的行为动作，如"播放"、"收藏"、"翻层"等等。
		 * @param  {string} label 事件标签，选填项，用于更详细的描述事件，从各个方面都可以，比如具体是哪个视频，哪部小说，翻到了第几层等等
		 * @param  {string} value 事件值，选填项，整数型，用于填写打分型事件的分值，加载时间型事件的时长，订单型事件的价格等等。
		 */
		 trackEvent:function(category,action,label,value){
		 	_hmt.push(["_trackEvent",category,action,label,value]);
		 },

		 /**
		 * 虚拟pv
		 * @method pageView
		 * 可以通过_hmt.push(['_setAutoPageview', false]);来关闭默认的pv,uv统计
		 * @param  {string} contentUrl 为需要统计PV的页面、弹层指定URL地址。必须以/开头
		 */
		 pageView:function(contentUrl){
		 	_hmt.push([ "_trackPageview",contentUrl,refererUrl]);
		 }
	};

	module.exports = stats;
});