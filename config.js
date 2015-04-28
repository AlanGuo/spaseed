define(function(require, exports,module){
	var spaseedConfig = {
		/**
		 * 页面模块基础路径
		 * @property basePath
		 * @type String
		 * @default 'modules/'
		 */
		'basePath': 'modules/',

		/**
		 * 页面包裹选择器
		 * @property pageWrapper
		 * @type String
		 * @default '#pageWrapper'
		 */
		'pageWrapper': '#pageWrapper',

		/**
		 * 右侧内容容器选择器
		 * @property appArea
		 * @type String
		 * @default '#appArea'
		 */
		'appArea': '#appArea',

		/**
		 * 切换页面需要更改class的容器选择器
		 * @property classWrapper
		 * @type String
		 * @default '#container'
		 */
		'classWrapper': '#container',

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
		 * @property switchMode
		 * @type String
		 * @default null
		 */
		'switchMode':null,

		/**
		 * 渲染前执行方法
		 * @property beforeRender
		 * @type Function
		 * @default function (controller, action, params) {}
		 */
		'beforeRender': function (controller, action, params) {
		},
		/**
		 * 渲染后执行方法
		 * @property beforeRender
		 * @type Function
		 * @default function (controller, action, params) {}
		 */
		'afterRender': function () {
			
		},

		/**
		 * 扩展路由，优先于框架路由逻辑
		 * @property extendRoutes
		 * @type Object
		 * @default {}
		 */
		'extendRoutes': {},

		/**
		 * 改变导航选中态
		 * @property changeNavStatus
		 * @type Function
		 * @default 通用方法
		 */
		'changeNavStatus': null,

		/**
		 * @obsolete
		 * layout模版
		 * @property layout
		 * @type Object
		 * @default {
						'default': {
							'controller': [],
							'module': 'spaseed/layout/default'
						}
					}
		 */
		 /*
		'layout': {
			'default': {
				'controller': [],
				'module': 'spaseed/layout/default'
			}
		},
		*/
		/**
		 * 首页模块名
		 * @property root
		 * @type String
		 * @default 'home'
		 */
		'root': 'home',

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


		'htmlError':'<section class="page-404"><div class="wrap-404" data-event="reload" style="text-align: center;margin-top: 35%;"><div class="tips">{{msg}}</div><div class="tips">轻触屏幕重新加载</div></div></section>',

		/**
		 * 请求错误默认提示文字
		 * @property defaultReqErr
		 * @type String
		 * @default '连接服务器异常，请稍后再试'
		 */
		'defaultReqErr': '连接服务器异常，请稍后再试',

		/**
		 * 请求错误回调
		 * @property reqErrorHandler
		 * @type Function
		 * @default null
		 */
		'reqErrorHandler': null,

		/**
		 * 追加的url请求参数
		 * @property additionalUrlParam
		 * @type Function
		 * @default null
		 */
		'additionalUrlParam': null,

		/**
		 * @property xhrProgress
		 * @type boolean
		 * @default false
		 */
		 'xhrProgress':true
	};

	module.exports = spaseedConfig;
})
