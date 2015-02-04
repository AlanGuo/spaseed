define('spaseed/main/datamanager', function(require, exports, module) {

	var spaseedConfig = require('spaseedConfig');
	var cache = {};

	/**
	 * 数据管理
	 * @class dataManager
	 * @static
	 */
	var dataManager = {

		_errorHandler: function (ret, tipErr) {

			var reqErrorHandler = spaseedConfig.reqErrorHandler;

			reqErrorHandler && reqErrorHandler(ret);
			
			//错误提示
			tipErr !== false && console.log(ret.msg || spaseedConfig.defaultReqErr);
		},

		/**
		 * 公共回调
		 * @method commonCb
		 * @param {Object}   ret     CGI返回JSON对象
		 * @param {Function} cb      成功回调(ret.code == 0)
		 * @param {Function} fail    失败回调
		 * @param {Boolean}  tipErr  提示公共错误 @default true
		 */
		commonCb: function (ret, cb, fail, tipErr) {
			var _self = this,
				_code = ret.code;
			if (_code == 0) {
				cb && cb(ret.data);
			} else {
				_self._errorHandler(ret, tipErr);
				fail && fail(ret);
			}
		},

		/**
		 * 获取缓存数据
		 * @method get
		 * @param {String} name 名称
		 * @return 缓存数据
		 */
		get: function (name) {
			return cache[name];
		},

		/**
		 * 设置缓存数据
		 * @method set
		 * @param {String} name 名称
		 * @param value 值
		 */
		set: function (name, value) {
			cache[name] = value;
		},

		/**
		 * 获取所有缓存数据
		 * @method getCache
		 * @return cache 缓存对象
		 */
		getCache: function () {
			return cache;
		},

		/**
		 * 清除所有缓存数据
		 * @method clearCache
		 */
		clearCache: function () {
			cache = {};
		}
	};

	module.exports = dataManager;

});
