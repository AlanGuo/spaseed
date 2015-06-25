define(function(require, exports,module){
	var spaseedConfig = {
		/**
		 * 页面模块基础路径
		 * @property basePath
		 * @type String
		 * @default '/app/script/module/'
		 */
		'basePath': '/app/script/module/',

		/**
		 * 页面包裹选择器
		 * @property pageWrapper
		 * @type String
		 * @default '#wrapper-all'
		 */
		'pageWrapper': '#wrapper-all',

		/**
		 * 页面顶部包裹元素
		 * @property top
		 * @type String
		 * @default '#top'
		 */
		'top':'#top',

		/**
		 * 页面底部包裹元素
		 * @property bottom
		 * @type String
		 * @default '#bottom'
		 */
		'bottom':'#bottom',

		/**
		 * 页面body容器
		 * @property container
		 * @type String
		 * @default '#body-container'
		 */
		'container': '#body-container',

		/**
		 * 切换页面需要更改class的容器选择器
		 * @property classWrapper
		 * @type String
		 * @default '#wrapper-all'
		 */
		'classWrapper': '#wrapper-all',

		/**
		 * 切换页面需要保留的class
		 * @property defaultClass
		 * @type String
		 * @default ''
		 */
		'defaultClass': '',

		/**
		 * 默认标题
		 * @property defaultTitle
		 * @type String
		 * @default 'spaseed'
		 */
		'defaultTitle': 'spaseed',

		//导航相关
		/**
		 * 导航容器选择器, 在各容器中遍历a标签, 执行选中态匹配
		 * @property navContainer
		 * @type Array
		 * @default ['body']
		 */
		'navContainer': ['body'],

		/**
		 * 导航选中class名
		 * @property navActiveClass
		 * @type String
		 * @default 'active'
		 */
		'navActiveClass': 'active',

		/**
		 * 页面切换方式
		 * @property switchMode  slideLeft,slideRight,fadeIn,
		 * @type String
		 * @default null
		 */
		'switchMode':null,

		/**
		 * 扩展路由，优先于框架路由逻辑
		 * @property extendRoutes
		 * @type Object
		 * @default {}
		 */
		'extendRoutes': {},

		/**
		 * 首页模块名
		 * @property root
		 * @type String
		 * @default 'home'
		 */
		'root': 'index',

		/**
		 * css配置
		 * @property css
		 * @type Object
		 * @default {}
		 */
		'css': {},

		/**
		 * 404提示
		 * @property 404Html
		 * @type String
		 * @default '<h2 id="tt404" style="text-align:center;padding-top:100px;font-size:20px;line-height:1.5;color:#999">'+
				   ' <p style="font-size:44px">404</p> 您访问的页面没有找到! </h2>'
		 */
		'html404': '<h2 id="tt404" style="text-align:center;padding-top:100px;font-size:20px;line-height:1.5;color:#999">'+
				   ' <p style="font-size:44px">404</p> 您访问的页面没有找到! </h2>',


		'htmlError':'<section class="page-404"><div class="wrap-404" data-click-event="reload" style="text-align: center;margin-top: 35%;"><div class="tips">{{msg}}</div><div class="tips">轻触屏幕重新加载</div></div></section>',


		/**
		 * 请求错误时展示更多错误信息
		 * @property showDetailError
		 * @type String
		 * @default true
		 */
		'showDetailError':true,
		/**
		 * 请求错误默认提示文字
		 * @property defaultReqErr
		 * @type String
		 * @default '连接服务器异常，请稍后再试'
		 */
		'defaultReqErr': '连接服务器异常，请稍后再试',

		/**
		 * 追加的url请求参数
		 * @property additionalUrlParam
		 * @type Function
		 * @default null
		 */
		'additionalUrlParam': null,

		/**
		 * xhr请求进度条，需要后台字段支持
		 * @property xhrProgress
		 * @type boolean
		 * @default false
		 */
		 'xhrProgress':true,

		/**
		 * 禁止container以外元素的touch事件
		 * @property disableTouchOutsideContainer
		 * @type boolean
		 * @default true
		 */
		 'disableTouchOutsideContainer': true,

		 /**
		 * 刷新的时候不replacehistory
		 * @property silentRefresh
		 * @type boolean
		 * @default false
		 */
		 'silentRefresh':false,

		 /**
		 * 切换模式
		 * @property html5Mode
		 * @type boolean
		 * @default true
		 */
		 'html5Mode':true,

		 /**
		 * 统计id，目前支持的是baidu统计
		 * @property statsId
		 * @type String
		 * @default ''
		 */
		 'statsId':'a2ede337a0b21b2991bd02c69befdc07',

		 /**
		 * 默认开启统计
		 * @property defaultStats
		 * @type boolean
		 * @default true
		 */
		 'defaultStats':true
	};

	module.exports = spaseedConfig;
})
