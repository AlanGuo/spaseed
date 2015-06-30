define('mp.env',function(require, exports, module){

	var env = {},ua = navigator.userAgent;
	var doc = document.documentElement
	var bod = document.body;
	env.resolution = {}
	env.resolution.x = Math.max(doc.clientWidth,bod.clientWidth);
	env.resolution.y = Math.max(doc.clientHeight,bod.clientHeight);

	env.isWX = /micromessenger/i.test(ua);
	env.isMobile = /iphone|ipad|android/i.test(ua);

	module.exports = env;
})

