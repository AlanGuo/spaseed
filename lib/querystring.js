
define(function(require, exports, module) {
	var $ = require('$');

	var querystring = {
		parse:function(queryString){
			var _result = {}, _pairs, _pair, _query, _key, _value;

			if (typeof(queryString) === 'object') { return queryString; }

			_query = queryString || window.location.search;

			if(_query){
				_query = _query.replace(/['"<>;?]/g, '');
				_pairs = _query.split('&');

				for(var i=0;i<_pairs.length;i++){
					var keyVal = _pairs[i];
					_pair = keyVal.split('=');
					_key = _pair[0];
					_value = _pair.slice(1).join('=');
					_result[decodeURIComponent(_key)] = decodeURIComponent(_value);
				}
			}

			return _result;
		},
		/**
		 * JSON对象转url字符串
		 * @method objectToParams
		 * @param  {Object} obj JSON对象
		 * @param  {Boolean} decodeUri url解码
		 * @return {String} url字符串
		 */
		stringify: function (obj, decodeUri) {
			var param = $.param(obj);
			if (decodeUri) {
				param = decodeURIComponent(param);
			}
			return param;
		}
	};

	module.exports = querystring;
});
