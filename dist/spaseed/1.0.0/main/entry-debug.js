define("spaseed/1.0.0/main/entry-debug", ["zepto/1.1.3/index-debug"], function(require, exports, module){

define(function(require, exports) {
	var $ = require("spaseed/1.0.0/lib/zepto-debug");
	var evt = require("spaseed/1.0.0/lib/event-debug");
	var util = require("spaseed/1.0.0/lib/util-debug");
	var spaseedConfig = require("spaseed/1.0.0/config/config-debug");
	var router = require("spaseed/1.0.0/main/router-debug");
	var pageManager = require("spaseed/1.0.0/main/pagemanager-debug");


	//spaseed初始化
    var init = function (config) {

    	//初始化页面管理
		pageManager.init();

		//初始化路由
		router.init({
			'html5Mode': true,
			'pageManager': pageManager,
			'routes': {
				'/': 'loadRoot',
				'/*controller(/*action)(/*p1)(/*p2)(/*p3)(/*p4)(/*p5)': 'loadCommon'
			},
			'extendRoutes': spaseedConfig.extendRoutes
		});

		//全局点击
		evt.addCommonEvent('click', { 
			'router': function () {
				var url = this.getAttribute("data-href");
				pageManager.redirect(url);
			},
			'back':function(){
				pageManager.back(this.getAttribute("data-href"));
			},
			'reload':function(){
				pageManager.reload();
			}
		});

	    //记录所有请求完毕
	    var win = window;
	    $(win).on('load',function () {
	   		win.isOnload = true;
	    });

	    window.addEventListener('touchmove', function(event) {
		   if(!pageManager.container[0].contains(event.target)) {
			event.preventDefault(); }
		}, false);

		pageManager.container.on('touchstart',function(event){
			var startY = startTopScroll = deltaY = undefined,
			startY = event.touches[0].pageY;
			startTopScroll = this.scrollTop;

			if(startTopScroll <= 0)
				this.scrollTop = 1;

			if(startTopScroll + this.offsetHeight >= this.scrollHeight)
				this.scrollTop = this.scrollHeight - this.offsetHeight - 1;
		})
    };

    exports.init = init;
});

});
define("spaseed/1.0.0/lib/zepto-debug", [], function(require, exports, module){
/* Zepto v1.1.2 - zepto event ajax form ie - zeptojs.com/license */

 define(function(require) {
(function( window, undefined ) {
var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return arguments.length === 0 ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = (text === undefined) ? '' : ''+text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return arguments.length === 0 ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string'){
			//return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
			//edit by liyi at 20140219 to fix css problem
			return element.style[camelize(property)] || computedStyle[camelize(property)]
		}else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var $$ = $.zepto.qsa, _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/=\?/, '=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data)
    return {
      url:      url,
      data:     hasData  ? data : undefined,
      success:  !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData  ? dataType || success : success
    }
  }

  $.get = function(url, data, success, dataType){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(url, data, success, dataType){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(url, data, success){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)


//add by liyi to use touch-plugin
;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming, transitionDelay,
    animationName, animationDuration, animationTiming, animationDelay,
    cssReset = {}

  function dasherize(str) { return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : name.toLowerCase() }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + vendor.toLowerCase() + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionDelay    = prefix + 'transition-delay'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationDelay     = prefix + 'animation-delay'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback, delay){
    if ($.isFunction(duration))
      callback = duration, ease = undefined, duration = undefined
    if ($.isFunction(ease))
      callback = ease, ease = undefined
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    if (delay) delay = parseFloat(delay) / 1000
    return this.anim(properties, duration, ease, callback, delay)
  }

  $.fn.anim = function(properties, duration, ease, callback, delay){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
        fired = false

    if (duration === undefined) duration = $.fx.speeds._default / 1000
    if (delay === undefined) delay = 0
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationDelay] = delay + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionDelay] = delay + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      } else
        $(this).unbind(endEvent, wrappedCallback) // triggered by setTimeout

      fired = true
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0){
      this.bind(endEvent, wrappedCallback)
      // transitionEnd is not always firing on older Android phones
      // so make sure it gets fired
      setTimeout(function(){
        if (fired) return
        wrappedCallback.call(that)
      }, (duration * 1000) + 25)
    }

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)

if ( typeof module === "object" && module && typeof module.exports === "object" ) {
  // Expose Zepto as module.exports in loaders that implement the Node
  // module pattern (including browserify). Do not create the global, since
  // the user will be storing it themselves locally, and globals are frowned
  // upon in the Node module world.
  module.exports = Zepto;s
} else {
  // Otherwise expose Zepto to the global object as usual
  window.Zepto = window.$ = Zepto;

  // Register as a named AMD module, since Zepto can be concatenated with other
  // files that may use define, but not via a proper concatenation script that
  // understands anonymous AMD modules. A named AMD is safest and most robust
  // way to register. Lowercase jquery is used because AMD module names are
  // derived from file names, and Zepto is normally delivered in a lowercase
  // file name. Do this after creating the global so that if an AMD module wants
  // to call noConflict to hide this version of Zepto, it will work.
  if ( typeof define === "function" && define.amd ) {
    define( "zepto", [], function () { return Zepto; } );
  }
}

})( window );
   return Zepto;
});

});
define("spaseed/1.0.0/lib/event-debug", ["zepto/1.1.3/index-debug"], function(require, exports, module){

/**
 * 事件管理
 * @class event
 * @static
 */
define('spaseed/lib/event', function(require, exports) {
	var util = require("spaseed/1.0.0/lib/util-debug");

	//默认判断是否有事件的函数
	var _defalutJudgeFn = function(elem){
		return !!elem.getAttribute("data-event");
	};

	//默认获取事件key的函数
	var _defaultGetEventkeyFn = function(elem){
		return elem.getAttribute("data-event");
	};

	//添加事件监听
	var addEvent = function (elem, event, fn) {
		if (elem.addEventListener)  // W3C
			elem.addEventListener(event, fn, true);
		else if (elem.attachEvent) { // IE
			elem.attachEvent("on"+ event, fn);
		}
		else {
			elem[event] = fn;
		}
	};
	
	//获取元素中包含事件的第一个子元素
	var getWantTarget = function(evt, topElem, judgeFn){
		
		judgeFn = judgeFn || this.judgeFn || _defalutJudgeFn;
		
		var _targetE = evt.srcElement || evt.target;
		
		while( _targetE  ){
			
			if(judgeFn(_targetE)){
				return _targetE;
			}
			
			if( topElem == _targetE ){
				break;
			}
		
			_targetE = _targetE.parentNode;
		}
		return null;
	};

	/**
	 * 通用的绑定事件处理
	 * @method bindCommonEvent
	 * @param {Element} 要绑定事件的元素
	 * @param {String} 绑定的事件类型
	 * @param {Object} 事件处理的函数映射
	 * @param {Function} 取得事件对应的key的函数
	 */
	var bindCommonEvent = function (topElem, type, dealFnMap, getEventkeyFn) {
		if (type === 'click') {
			util.isMobile() && (type = 'tap');
		}
		
		getEventkeyFn =  getEventkeyFn || _defaultGetEventkeyFn;
		
		var judgeFn = function (elem) {
			return !!getEventkeyFn(elem);
		};

		var hdl = function(e){
			/**
			 * 支持直接绑定方法
			 */
			var _target = getWantTarget(e, topElem, judgeFn), _hit = false;
			
			if (_target) {
				var _event = getEventkeyFn(_target);
				var _returnValue;


				if(Object.prototype.toString.call(dealFnMap)==="[object Function]"){
					_returnValue = dealFnMap.call(_target,e,_event);
					_hit = true
				}
				else{
					if(dealFnMap[_event]){
						_returnValue = dealFnMap[_event].call(_target, e)
						_hit = true;
					}
				}
				if(_hit){
					if(!_returnValue){
						if(e.preventDefault)
			                e.preventDefault();
			            else
			                e.returnValue = false;
					}
				}
				
			}
			
		}

		if (type === 'tap') {
			(function(){
				var isTap = true;
				addEvent(topElem,'touchstart',function(){
					isTap = true;
				})
				addEvent(topElem,'touchmove',function(){
					isTap = false;
				})
				addEvent(topElem,'touchend',function(e){
					if (isTap) {
						hdl(e);
					}
				})
			})()
		} else {
			addEvent(topElem, type, hdl);
		}
		
	};

	var commonEvents = {};

	var initEvent = function(type,topElem){

		

		var getEventkeyFn =   _defaultGetEventkeyFn;
		
		var judgeFn = function (elem) {
			return !!getEventkeyFn(elem);
		};
		var hdl = function(e){

			/**
			 * 支持直接绑定方法
			 */
			var _target = getWantTarget(e, topElem, judgeFn), _hit = false;
			var dealFnMap = commonEvents[type];
			
			if (_target) {

				var _event = getEventkeyFn(_target);
				var _returnValue;


				if(dealFnMap[_event]){

					_returnValue = dealFnMap[_event].call(_target, e)
					_hit = true;
				}
				if(_hit){
					if(!_returnValue){
						if(e.preventDefault)
			                e.preventDefault();
			            else
			                e.returnValue = false;
					}
				}
				
			}
			
		}

		
		if (type === 'tap') {

			(function(){

				var x1=0,y1=0,x2=0,y2=0,flag = false;
				addEvent(topElem,'touchstart',function(e){

					var touch = e.touches[0];
					x1 = touch.pageX;
					y1 = touch.pageY;

					flag = false;

				})
				addEvent(topElem,'touchmove',function(e){
					
					var touch = e.touches[0];
					x2 = touch.pageX;
					y2 = touch.pageY;
					
					flag = true;
				})
				addEvent(topElem,'touchend',function(e){
					if(flag){
						var offset = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
						if(offset < 5){
							hdl(e)
						}
					}
					else{
						hdl(e)
					}
					
				})
			})()
			
		} else {
			addEvent(topElem, type, hdl);
		}
	}

	/**
	 * 为body添加事件代理
	 * @method addCommonEvent
	 * @param {type} 事件类型
	 * @param {dealFnMap} 事件处理的函数映射
	 */
	var addCommonEvent = function(type, dealFnMap) { 

		if (type === 'click') {
				util.isMobile() && (type = 'tap');
		}

		if (!commonEvents[type]) {
			commonEvents[type] = dealFnMap || {};
			initEvent(type,document.body)
		}
		else{
			for (var key in dealFnMap) {
				commonEvents[type][key] = dealFnMap[key];
			}	
		}
		
	};

	//绑定代理事件，自定义代理对象
	exports.bindCommonEvent = bindCommonEvent;

	//统一绑定body的代理事件
	exports.addCommonEvent = addCommonEvent;
});
});
define("spaseed/1.0.0/lib/util-debug", ["zepto/1.1.3/index-debug"], function(require, exports, module){

define('spaseed/lib/util', function(require, exports, module) {
	var $ = require("zepto/1.1.3/index-debug");
	window.console = window.console || {log:function(){}};

	var from = '';

	;(function(){
		var result = /from=(\w+)/i.exec(window.location.search)
		if(result){
			from = result[1];
		}
	})()


	/**
	 * 工具类
	 * @class util
	 * @static
	 */
	var util = {
		cookie: {
			/**
			 * 获取cookie
			 * @method get
			 * @param  {String} name 名称
			 * @return {String} 
			 */
			get: function (name) {
				var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
					m = document.cookie.match(r);

				return !m ? "" : m[1];
			},
			/**
			 * 设置cookie
			 * @method set
			 * @param {String} name 名称
			 * @param {String} value 值
			 * @param {String} domain 域
			 * @param {String} path 路径
			 * @param {String} hour 过期时间(小时)
			 */
			set: function (name, value, domain, path, hour) {
				if (hour) {
					var expire = new Date();
					expire.setTime(expire.getTime() + 36E5 * hour);
				}
				document.cookie = name + "=" + value + "; " + (hour ? "expires=" + expire.toGMTString() + "; " : "") +
					(path ? "path=" + path + "; " : "path=/; ") + (domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");

				return true;
			},
			/**
			 * 删除cookie
			 * @method del
			 * @param {String} name 名称
			 * @param {String} domain 域
			 * @param {String} path 路径
			 */
			del: function(name, domain, path) {
				document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " +
					(path ? "path=" + path + "; " : "path=/; ") +
					(domain ? "domain=" + domain + ";" : "domain=" + document.domain + ";");
			}
		},

		/**
		 * html模板生成器, =号转义, -号原始输出
		 * @method tmpl
		 * @param  {String} str html模板字符串 | script模版元素Id
		 * @param  {Object} data 用于生成模板的数据对象
		 * @param  {Object} [mixinTmpl] 混合模版对象
		 * @return {String} 返回 html 字符串
		 * @example 
		 *		var careerTmpl = '<div><%=career%></div>';
		 * 		util.tmpl('<h1><%=user%></h1> <%#careerTmpl%>', {user:'evanyuan', career: '前端工程师'}, {careerTmpl: careerTmpl});
		 */
		tmpl: function () {
      		var _cache = {},
  				_escape = function (str) {
  					str = (str || '').toString();
			    	return str.replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
				},
				_getTmplStr = function (rawStr, mixinTmpl) {
					if (mixinTmpl) {
						for (var p in mixinTmpl) {
							var r = new RegExp('<%#\\s?' + p + '%>', 'g');
							rawStr = rawStr.replace(r, mixinTmpl[p]);
						}
					}
					return rawStr;
				};
      			
			return function tmpl(str, data, mixinTmpl) {
				var strIsKey = !/\W/.test(str);
        		!strIsKey && (str = _getTmplStr(str, mixinTmpl));

	        	var fn = strIsKey ? _cache[str] = _cache[str] || tmpl(_getTmplStr(document.getElementById(str).innerHTML, mixinTmpl)) :
                    new Function("obj", "_escape", "var _p='';with(obj){_p+='" + str
                        .replace(/[\r\t\n]/g, " ")
                        .split("\\'").join("\\\\'")
                        .split("'").join("\\'")
                        .split("<%").join("\t")
                        .replace(/\t-(.*?)%>/g, "'+$1+'")
                        .replace(/\t=(.*?)%>/g, "'+_escape($1)+'")
                        .split("\t").join("';")
                        .split("%>").join("_p+='")
                    + "';} return _p;");

	        	var render = function (data) {
	        		return fn(data, _escape)
	        	};

				return data ? render(data) : render;
			};
		}(),

		/**
		 * 将 URL 参数格式转化成对象
		 * @method paramsToObject
		 * @param  {String} [queryString] 要转换的 key-value 字符串，默认为 location.search
		 * @return {Object}
		 */
		paramsToObject: function (queryString) {
			var _result = {}, _pairs, _pair, _query, _key, _value;

			if (typeof(queryString) === 'object') { return queryString; }

			_query = queryString || window.location.search;
			_query = _query.replace('?', '');
			_pairs = _query.split('&');

			$(_pairs).each(function (i, keyVal) {
				_pair = keyVal.split('=');
				_key = _pair[0];
				_value = _pair.slice(1).join('=');
				_result[decodeURIComponent(_key)] = decodeURIComponent(_value);
			});

			return _result;
		},

		/**
		 * JSON对象转url字符串
		 * @method objectToParams
		 * @param  {Object} obj JSON对象
		 * @param  {Boolean} decodeUri url解码
		 * @return {String} url字符串
		 */
		objectToParams: function (obj, decodeUri) {
			var param = $.param(obj);
			if (decodeUri) {
				param = decodeURIComponent(param);
			}
			return param;
		},
		getAtk:function(name){
			var _skey = this.cookie.get(name);
			if(_skey){
				var hash = 5381;

				for (var i = 0, len = _skey.length; i < len; ++i) {
					hash += (hash << 5) + _skey.charCodeAt(i);
				}
				return hash & 0x7fffffff;
			}		
		},

		/**
		 * 是否移动手机
		 * @method isMobile
		 * @return {boolean} true|false
		 */
		isMobile: function () {
			return this.isAndroid() || this.isIOS();
		},

		/**
		 * 是否android
		 * @method isAndroid
		 * @return {boolean} true|false
		 */
		isAndroid: function () {
			return /android/i.test(window.navigator.userAgent);

		},

		/**
		 * 是否ios
		 * @method isIOS
		 * @return {boolean} true|false
		 */
		isIOS: function () {
			return /iPod|iPad|iPhone/i.test(window.navigator.userAgent)
		},

		/**
		 * 获取a标签href相对地址
		 * @method getHref
		 * @param  {Object} item dom节点
		 * @return {String} href
		 */
		getHref: function (item) {
			var href = item.getAttribute('href', 2);
			href = href.replace('http://' + location.host, '');
			return href;
		},

		/**
		 * 深度拷贝对象
		 * @method cloneObject
		 * @param  {Object} obj 任意对象
		 * @return {Object} 返回新的拷贝对象
		 */
		cloneObject: function (obj) {
			var o = obj.constructor === Array ? [] : {};
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					o[i] = typeof obj[i] === "object" ? this.cloneObject(obj[i]) : obj[i];
				}
			}
			return o;
		},

		/**
		 * 模拟滚动
		 * @method emulateScroll
		 * @param  {Object} scrollElem 任意对象
		 */
		emulateScroll:function(scrollElem){
			var startMove = false,
                initY = 0,
                containerInitY = 0,
                containerMoveY = 0;

            scrollElem.on('touchstart',function(evt){
                startMove = true;
                initY = evt.touches[0].clientY;
            });
            scrollElem.on('touchmove',function(evt){
                if(startMove){
                    var disY = evt.touches[0].clientY - initY;
                    containerMoveY = containerInitY + disY;
                    var max = scrollElem.prop('clientHeight')-scrollElem.prop('scrollHeight');
                    var val = 0;
                    if(containerMoveY < 0 && containerMoveY > max){
                    	val = containerMoveY;
                    }
                    else if(containerMoveY>0){
                    	val = 0;
                        containerMoveY = 0;
                    }
                    else if(containerMoveY<max){
                    	val = max;
                        containerMoveY = max;
                    }
                    else{
                    	val = containerMoveY;
                        containerMoveY = containerInitY;
                    }
                    scrollElem.children(':first-child').css('-webkit-transform','translate3d(0,'+val+'px,0)');

                    //把移动的值，写入属性中
                    scrollElem.attr('data-scrolltop',-val);
                    //scrollElem.scrollTop(-val);
                    var event = $.Event('scroll');
					scrollElem.trigger(event);
                }
            });
            scrollElem.on('touchend',function(){
                startMove = false;
                containerInitY = containerMoveY;
                containerMoveY = 0;
            });
		},

		/**
		 * 插入内部样式
		 * @method insertStyle
		 * @param  {string | Array} rules 样式
		 * @param  {string} id 样式节点Id
		 */
		insertStyle: function (rules, id) {
			var _insertStyle = function () {
				var doc = document,
					node = doc.createElement("style");
				node.type = 'text/css';
				id && (node.id = id);
				document.getElementsByTagName("head")[0].appendChild(node);
				if (rules) {
					if (typeof(rules) === 'object') {
						rules = rules.join('');
					}
					if (node.styleSheet) {
						node.styleSheet.cssText = rules;
					} else {
						node.appendChild(document.createTextNode(rules));
					}
				}
			};
			if (id) {
				!document.getElementById(id) && _insertStyle();
			} else {
				_insertStyle();
			}
		},
		/**
		 *统计分享时，生成随机UID	
		 * @method getRandom
		 * @param  {string} pre 前缀
		*/ 
		getRandom:function(pre){
			var pre=pre||'';
			return pre+(Math.round((Math.random()||0.5) * 2147483647) * (+new Date())) % 10000000000;
		},
		ping:function(){
			function getUserInfo(){
				var main={
					pvi:'',					
					si:'',						
					arg:'',				
					ty:1					
				}
				main.pvi=function(){
					var pvi=util.cookie.get('pgv_pvi');
					!pvi&&function(){
						main.ty=0;
						pvi=util.getRandom();
						util.cookie.set('pgv_pvi',pvi,'','',24*365)
					}();
					return pvi;
				}();
				main.si=function(){
					var si=util.cookie.get('pgv_si');
					!si&&function(){
						si=util.getRandom('s');
						util.cookie.set('pgv_si',si)
					}();
					return si;
				}();
				return main;
			}
			function getReferer(){
				
				if(from){
					return {rdm:location.hostname,rurl:'/'+from,rarg:''}	
				}
				else{
					var atag = document.createElement('a'),path;
					atag.href = document.referrer;
					return {rdm:atag.hostname,rurl:atag.path,rarg:encodeURIComponent(atag.search||'')}	
				}
				
			}

			function getEnvInfo(){
				
				var nav=navigator,sc=screen||{width:'',height:'',colorDepth:''};
				var env={
					 scr:sc.width+'x'+sc.height,
					 scl:(window.devicePixelRatio||1)+'-bit',
					 lg:nav.language.toLowerCase(),
					 tz:new Date().getTimezoneOffset()/60
				};
				
				return env;
			}
			return function(r2,dm,url,r3){
				var pool=[];
				var main = {
					r2:r2,
					dm:dm,
					url:url,
					r3:r3
				}
				for(
					var i=0,arr=[main,getUserInfo(),getReferer(),getEnvInfo(),{'random':+new Date()}],l=arr.length;
					i<l;
					i++
				){
					for(var p in arr[i]){
						arr[i].hasOwnProperty(p)&&pool.push(p+'='+(arr[i][p]||''));
					}
				}

				var src='http://pingtcss.qq.com/pingd?'+pool.join('&');
				
				var img=new Image();
				img.onload = img.onerror = img.onabort = function() {
		            img.onload = img.onerror = img.onabort = null;
		            img=null;
		        };
				img.src=src;
			}
		}()
	};

	
	;(function(){
	
		var ua = navigator.userAgent;
		var isApp = /ALA/.test(ua);

		if(isApp){
			if(util.isIOS()){
				from = "iosapp"
			}
			else if(util.isAndroid()){
				from = "androidapp"
			}
		}
	})();
	

	module.exports = util;
});

});
define("spaseed/1.0.0/config/config-debug", [], function(require, exports, module){
define('spaseed/config/config', function(require, exports) {
	var $ = require("spaseed/1.0.0/lib/zepto-debug");
	/** 
	 * 页面管理参数配置
	 * @class spaseedConfig
	 * @static
	 */
	var config = {

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

	exports.config = config;
});

});
define("spaseed/1.0.0/main/router-debug", ["zepto/1.1.3/index-debug"], function(require, exports, module){

define('spaseed/main/router', function(require, exports, module) {
  var dataManager = require("spaseed/1.0.0/lib/datamanager-debug");
  var docMode = document.documentMode;
  var oldIE = (/msie [\w.]+/.test(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
  var pushState = window.history.pushState;
  
  var urls = [];
  var count = 0;

  /**
   * 路由管理
   * @class router
   * @static
   */
  var router = {
    /**
     * 初始化
     * @param {Object} option 参数
     * @method init
     */
    init: function (option) {

      this.option = {

        //是否使用html5 history API设置路由
        'html5Mode': true,

        //页面管理对象
        'pageManager': {},

        //路由映射对象
        'routes': {},

        //扩展路由，优先于框架内部路由routes对象
        'extendRoutes': {},

        //低端浏览器监听url变化的时间间隔
        'interval': 50,

        //低端浏览器如设置了domain, 需要传入
        'domain': ''

      };

      option = option || {};

      for (var p in option) {
        this.option[p] = option[p];
      }

      //扩展路由
      if (this.option['extendRoutes']) {
        this.extend(this.option['extendRoutes']);
      }

      this.option['html5Mode'] = (pushState && this.option['html5Mode']);

      //支持debug模式(url加上debug后不改变页面切换逻辑,可有针对性做一些事情)
      this.debug = false;
      var locationHref = window.location.href;
      if (/\/debug_online/.test(locationHref)) {
        this.debug = '/debug_online';
      } else if (/\/debug/.test(locationHref)) {
        this.debug = '/debug';
      }

      var _self = this,

          evt = this.option['html5Mode'] ? 'popstate' : 'hashchange';

      var start = function () {

          dataManager.set('real_url',window.location.href.split('#')[0]);

          var search = window.location.search;

          if(search){
              dataManager.set('search',search);
          }

          var initPath = _self.getFragment() ? _self.getFragment() : '/';

          if (initPath === '/index.html') {
            initPath = '/';
          }

          //完整路径在hash环境打开则转化为锚点路径后跳转
          if (!_self.option['html5Mode'] && !/#(.*)$/.test(locationHref) && initPath !== '/') {
            location.replace('/#' + initPath);
            return;
          }

          _self.navigate(initPath, false, true);
      };

      if (oldIE) {

        //ie8以下创建iframe模拟hashchange
        var iframe = document.createElement('iframe');
        iframe.tabindex = '-1';
        if (this.option['domain']) {
          iframe.src = 'javascript:void(function(){document.open();'+
                       'document.domain = "' + this.option['domain'] + '";document.close();}());';
        } else {
          iframe.src = 'javascript:0';
        }
        iframe.style.display = 'none';

        var _iframeOnLoad = function () {
            iframe.onload = null;
            iframe.detachEvent('onload', _iframeOnLoad);
            start();
            _self.checkUrlInterval = setInterval(function () {
              _self.checkUrl();
            }, _self.option['interval']);
        };
        if (iframe.attachEvent) {
            iframe.attachEvent('onload', _iframeOnLoad);
        } else {
            iframe.onload = _iframeOnLoad;
        }

        document.body.appendChild(iframe);
        this.iframe = iframe.contentWindow;
       
      } else {

        //其他浏览器监听popstate或hashchange
        this.addEvent(window, evt, function (e) {
          _self.checkUrl(e);
        });

      }

      if (!this.iframe) {
        start();
      }
     
    },

    /**
     * 事件监听
     */
    addEvent: function (elem, event, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(event, fn, false);
      } else if (elem.attachEvent) { 
        elem.attachEvent("on" + event, fn);
      } else {
        elem[event] = fn;
      }
    },

    /**
     * 获取hash值
     * @method getHash
     * @param {Object} win 窗口对象
     * @return {String} hash值
     */
    getHash: function (win) {
      var match = (win || window).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    /**
     * 获取url片段
     * @method getFragment
     * @return {String} url片段
     */
    getFragment: function () {
      var fragment, 
          pathName = window.location.pathname+window.location.search;

      if (this.option['html5Mode']) {
        fragment = pathName;
        //如果锚点路径在html5Mode环境打开 
        if (fragment === '/' && this.getHash()) {    
          fragment = this.getHash();
        }
      } else {
        fragment = this.getHash();
        //如果完整路径在hash环境打开
        if (fragment === '' && pathName !== '/' && pathName !== '/index.html') { 
          fragment = pathName;
        }
      }
      return fragment;
    },

    /**
     * 监听url变化
     */
    checkUrl: function (e) {
      var current = this.getFragment();
      if (this.debug) {
        current = current.replace(this.debug, '');
      }
      if (this.iframe) {
        current = this.getHash(this.iframe);
      }
      if (current === this.fragment) {
        return
      }

      if(typeof e == 'object' && e.state){
          count = e.state.count - 1;
      }
      this.navigate(current, false, true);
    },
    back:function(){

        //可恶的硬编码
        if(/detail/.test(window.location.pathname)){
          this.navigate('/')
        }
        else{
          history.back();
        }
        //if(count -1 >0){
        
           /*
        }
        else{
          this.navigate('/')
        }
        */
    },

    /**
     * 去除前后#
     */
    stripHash: function (url) {
      return url.replace(/^\#+|\#+$/g, '');
    },

    /**
     * 去除前后斜杠
     */
    stripSlash: function (url) {
      return url.replace(/^\/+|\/+$/g, '');
    },

    /**
     * 导航
     * @method navigate
     * @param {String}  url 地址
     * @param {Boolean} slient 不改变地址栏
     * @param {Boolean} replacement 替换浏览器的当前会话历史(h5模式时支持)
     */
    navigate: function (url, slient, replacement) {

      if(!replacement){
         count++;
      }

      var _self = this;
      
      if (url !== '/') {
        url = _self.stripHash(url);
        url = _self.stripSlash(url);
        url = '/' + url; 
      }
      
      if (url !== _self.fragment && !slient) {//slient为true时，只路由不改变地址栏
        if (_self.debug) {
          url = url.replace(_self.debug, '');
          url = _self.debug + url;
        }
        if (_self.option['html5Mode']) {
          var _stateFun = replacement ? 'replaceState' : 'pushState';
          history[_stateFun]({count:count}, document.title, url);
        } else {
          if (url !== '/' || _self.getFragment()) {
            location.hash = url; 
            _self.iframe && _self.historySet(url, _self.getHash(_self.iframe));
          } 
        }
      }

      if (_self.debug) {
        url = url.replace(_self.debug, '');
        !url && (url = '/');
      }

      /**
       * 当前url片段
       * @property fragment
       * @type String
       */
      _self.fragment = url;

      url = url.split('?')[0];

      _self.loadUrl(url);

      
    },

    /**
     * 低端浏览器设置iframe历史
     */
    historySet : function(hash, historyHash) {
        var iframeDoc = this.iframe.document;

        if (hash !== historyHash) {
          iframeDoc.open();
          if (this.option['domain']) {
            iframeDoc.write('<script>document.domain="' + this.option['domain'] + '"</script>');
          }
          iframeDoc.close();
          this.iframe.location.hash = hash;
        }
    },

    /**
     * 重定向
     * @method redirect
     * @param {String}  url 地址
     * @param {Boolean} slient 不改变地址栏
     * @param {Boolean} replacement 替换浏览器的当前会话历史(h5模式时支持)
     */
    redirect: function (url, slient, replacement) {
      this.navigate(url, slient, replacement);
    },

    /**
     * 路由匹配
     * @method matchRoute
     * @param  {String} rule 路由规则
     * @param  {String} url 地址
     * @return {Array}  参数数组
     */
    matchRoute: function (rule, url) {
      var optionalReg = /\((.*?)\)/g,
          paramReg = /(\(\?)?:\w+/g,
          astReg = /\*\w+/g,
          ruleToReg = function (rule) {
            rule = rule.replace(optionalReg, '(?:$1)?').replace(paramReg, '([^\/]+)').replace(astReg, '(.*?)');
            return new RegExp('^' + rule + '$');
          },
          route = ruleToReg(rule),
          result = route.exec(url),
          params = null;

      if (result) {
        var args = result.slice(1);
        params = [];
        for (var i = 0, p; p = args[i]; i++){      
           params.push(p ? decodeURIComponent(p) : ''); 
        }
      }
      return params;
    },

    /**
     * 扩展路由
     * @method extend
     * @param {Object} obj 路由map
     */
    extend: function (obj) {
      obj = obj || {};
      if (this.extendRoutes) {
        $.extend(this.extendRoutes, obj);
      } else {
        this.extendRoutes = obj;
      }
    },

    /**
     * queryString转对象
     */
    queryToObj: function (queryStr) {
      var urlPara = queryStr.split('?')[1];
      urlPara = urlPara.split('&');
      var objPara = {};
      for (var i=0, item; item = urlPara[i]; i++) {
        var itemArr = item.split('=');
        objPara[itemArr[0]] = itemArr[1];
      }
      return objPara;
    },

    /**
     * 执行路由匹配的方法
     */
    applyAction: function (action, params, urlParam, pointer) {
      urlParam && params.push(urlParam);
      action && action.apply(pointer, params);
    },

    /**
     * 加载页面
     * @method loadUrl
     * @param {String} url 地址
     */
    loadUrl: function (url) {
      var _self = this,
          extendRoutes = _self.extendRoutes,
          routes = _self.option.routes,
          pm = _self.option.pageManager,
          params = null,
          urlParam = null,
          searchReg = /\/?\?.*/,
          searchMatch = searchReg.exec(url),
          url = url.replace(searchReg,'');

      searchMatch && (urlParam = this.queryToObj(searchMatch[0]));

      //优先匹配框架外部定义路由
      /*
      if (extendRoutes) {
        for (var exRule in extendRoutes) {
          if (params = _self.matchRoute(exRule, url)) {
            this.applyAction(extendRoutes[exRule], params, urlParam, null);
            return 
          }
        }
      }
      */
      //匹配框架内部路由规则
      for (var rule in routes) {
          if (params = _self.matchRoute(rule, url)) {
            this.applyAction(pm[routes[rule]], params, urlParam, pm);
            break;
          }
      } 
    }

  };

  module.exports = router;

});

});
define("spaseed/1.0.0/lib/datamanager-debug", ["zepto/1.1.3/index-debug"], function(require, exports, module){
define(function(require, exports) {
	var $ = require("zepto/1.1.3/index-debug");
	var spaseedConfig = require("spaseed/1.0.0/config/config-debug");
	var cache = {};

	/**
	 * 数据管理
	 * @class dataManager
	 * @static
	 */
	var dataManager = {

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

	exports.dataManager = dataManager;

});

});
define("spaseed/1.0.0/main/pagemanager-debug", ["zepto/1.1.3/index-debug"], function(require, exports, module){

define('spaseed/main/pagemanager', function(require, exports, module) {
	var $ = require("spaseed/1.0.0/lib/zepto-debug");
	var router = require("spaseed/1.0.0/main/router-debug");
	var util = require("spaseed/1.0.0/lib/util-debug");
	var spaseedConfig = require("spaseed/1.0.0/config/config-debug");
	var dataManager = require("spaseed/1.0.0/lib/datamanager-debug");

	/** 
	 * 页面管理
	 * @class pageManager
	 * @static
	 */
	var pageManager = {

		/**
		 * 初始化
		 * @method init
		 */
		init: function () {
			/**
			 * 页面包裹容器
			 * @property pageWrapper
			 * @type Object
			 */
			this.pageWrapper = $(spaseedConfig.pageWrapper);

			/**
			 * 页面主容器，这里应该移出框架逻辑
			 * @property container
			 * @type Object
			 */
			this.container = $(spaseedConfig.container);
		},	


		/**
		 * 加载首页
		 */
		loadRoot: function () {
			this.loadView(spaseedConfig.root);
		},

		/**
		 * 统一加载视图方法
		 */
		loadCommon: function () {
			var _self = this,
				arr = [].slice.call(arguments);

			//解析路由匹配
			this.parseMatch(arr, function (controller, action, params) {
				//处理路由, 加载视图
				_self.loadView(controller, action, params);
			})
		},

		/**
		 * 解析路由匹配
		 * @method parseMatch
		 * @param {Array}    arr 路由匹配到的参数
		 * @param {Function} cb  回调函数
		 */
		parseMatch: function (arr, cb) {
			var controller = null,
				action = null,
				params = [];

			//获取controller
			controller = arr[0];

			//获取action与params
			if (arr.length > 1) {
				if (typeof(arr[1]) === 'object') {
					params.push(arr[1]);
				} else {
					action = arr[1];
					params = arr.slice(2);
				}
			}

			cb(controller, action, params);

		},
		placeholder:function(container){
			container = container || this.container;

			container.find('img[raw]').each(function(){
                var img = $(this);
                var raw = img.attr('raw');
                var tmp = new Image();
                var off = false;
                $(tmp).on('load',function(){
                    if(!off){
                        img.attr('src',raw);
                        tmp = undefined;
                    }
                }).attr('src',raw)
                if(tmp.complete){
                    off = true;
                    img.attr('src',raw);
                    tmp = undefined;
                }
            })
			
		},
		redirect:function(controller, action, params, replacement){
			var pathname = arguments[0];
			if(arguments.length > 1){
				pathname = [controller,action,params.join('/')].join('/');
			}
			this.loadUrl(pathname,replacement);
		},
		reload:function(){
			var url = router.getFragment() || '/';
			this.loadUrl(url);
		},
		back:function(){
			this._destroy();
			router.back(true)
		},
		loadUrl:function(url,replacement){
			var destroy = this._destroy();
			replacement = replacement==null? destroy:replacement; //销毁当前页面
			router.navigate(url,false,replacement);
		},
		/**
		 * 统一路由处理函数
		 * @method loadView
		 * @param {String} controller 
		 * @param {String} action 
		 * @param {Array} params 
		 */
		loadView: function (controller, action, params) {
			var _self = this;

			//渲染前执行业务逻辑
			if (spaseedConfig.beforeRender) {
				if (spaseedConfig.beforeRender(controller, action, params) === false) {
					return
				}
			};

			params = params || [];

			/*
			//渲染公共模版
			this.renderLayout(controller, action, params);
			*/

			//存储主要jQuery dom对象

			/**
			 * 右侧内容容器
			 * @property appArea
			 * @type Object
			 */
			this.appArea = $(spaseedConfig.appArea);

			/**
			 * 切换页面需要更改class的容器
			 * @property classWrapper
			 * @type Object
			 */
			this.classWrapper = $(spaseedConfig.classWrapper);

			//模块基础路径
			var basePath = spaseedConfig.basePath;

			//模块id按照如下规则组成
			var controllerId = basePath + controller + '/' + controller,
				actionId = basePath + controller + '/' + action + '/' + action;

			var moduleArr = []; 

			//检查是否存在controller模块
			if (seajs.hasDefined[controllerId]) {
				moduleArr.push(controllerId);
			} else {
				controllerId = '';
			}

			//检查是否存在action模块
			if (action) {
				if (!seajs.hasDefined[actionId]) {
					_self.render404();
					return
				}
				moduleArr.push(actionId);
			} else {
				// 未指明action，默认尝试查询index
				var indexUri = basePath + controller + '/index/index';
				if (seajs.hasDefined[indexUri]) {
					moduleArr.push(indexUri);
					action = 'index';
				} else {
					//未指明action，且controller也不曾定义
					if (!controllerId) {
						_self.render404();
						return
					}
				}
			}

			//需加载的css资源
			var cssReqUrl = _self.addCssReq(controller, action);

			//加载css
			cssReqUrl.length && require.async(cssReqUrl);	

			//获取页面模块对外接口
			require.async(moduleArr, function(cObj, aObj) {
				
				//controller未定义, 此时cObj属于一个action 
				if (!controllerId) {
					aObj = cObj;
				}

				//执行controller, 判断同contoller下的action切换, contoller不需要再重复执行
				if (controllerId && (!_self.fragment || _self.fragment.indexOf('/' + controller) < 0 || !action)) {
					_self.renderView(cObj, params);
				} 
				_self.fragment = (router.fragment === '/') ? '/' + controller : router.fragment;
				_self.fragment = _self.fragment.replace(/\/?\?.*/,'');

				//执行action
				if (action) {
					_self.renderView(aObj, params);
					_self.currentViewObj = aObj;
					controllerId && (_self.currentCtrlObj = cObj);
				} else {
					_self.currentViewObj = cObj;
				}


		  		//设置页面标题
		  		_self.setTitle(cObj, aObj); 
				
			});

		},


		/**
		 * 通过配置组装css请求
		 * (单页面模式会有先出dom后出样式的情况，不建议使用这种动态加载方式)
		 */
		addCssReq: function (controller, action) {
			var cssConfig = spaseedConfig.css,
				controllerCssReq = cssConfig[controller],
				actionCssReq = cssConfig[controller + '_' + action],
				reqUrl = [],
				concatReqUrl = function (cssArr) {
                    for (var i = 0; i < cssArr.length; i++) {
                       //csspath可通过seajs的map参数配置映射
					   cssArr[i] && (reqUrl = reqUrl.concat('csspath/' + cssArr[i]));
                    }
				}; 

			controllerCssReq && concatReqUrl(controllerCssReq['cssFile']);	
			actionCssReq && concatReqUrl(actionCssReq['cssFile']);
			return reqUrl;
		},

		/**
		 * @obsolete
		 * 渲染公共模版
		 * 框架不负责任何显示
		 */
		 /*
		renderLayout: function (controller, action, params) {
			var _self = this,
				layoutConfig = spaseedConfig.layout,
				layout = 'default',
				_render = function (layoutName) {
					if (_self.layout != layoutName) {
						require.async(layoutConfig[layoutName]['module'], function (_layout) {
							_layout.render();
						})
						_self.layout = layoutName;
					} 
				};

			loop: for (var key in layoutConfig) {
				var controllerArr = layoutConfig[key].controller || [];
				for (var i = 0, c; c = controllerArr[i]; i++) {
					if (controller === c) {
						layout = key;
						break loop;
					}
				}
			}
			_render(layout);
		},
		*/
		/**
		 * 渲染视图
		 */
		renderView: function (obj, params) {
		
            //debugger
			if (obj && obj.render) {
				obj.render.apply(obj, params);
			} else {
				this.render404();
			}

			/*是不是可以在这里加入*/ 
			//渲染后执行业务逻辑
			if (spaseedConfig.afterRender) {
				spaseedConfig.afterRender();
			}
		},

		/**
		 * 渲染404
		 * @method render404
		 */
		render404: function () {
			var notFound = spaseedConfig.html404;
			var container = this.appArea.length ?  this.appArea : this.container;
			container.html(notFound);
		},
		renderError: function (msg) {
			var htmlError = spaseedConfig.htmlError;
			var container = this.appArea.length ?  this.appArea : this.container;
			container.html(htmlError.replace('{{msg}}',msg));
		},
		isEmpty:function(){
			return this.container.html().length < 10;
		},

		/**
		 * 设置页面标题
		 */
		setTitle: function (cObj, aObj) {
			if (aObj && aObj.title) {
				document.title = aObj.title;
			} else if (cObj && cObj.title) {
				document.title = cObj.title;
			} else {
				var defaultTitle = spaseedConfig.defaultTitle;
				if (document.title != defaultTitle) {
					document.title = defaultTitle;
				}
			}
		},

		/**
		 * 框架的渲染方法
		 * @param {Object} option 选项
		 * @param {Element} option.container 容器
		 * @param {Element} option.scroll 滚动距离
		 */
		html:function(option){
			
            if(option.container  !== undefined ){
            	this.container.html(option.container);
            }

            //滚动逻辑
            if(option.scroll !== undefined){

				setTimeout(function(){
					var defaultClass = spaseedConfig.defaultClass,
						classWrapper = pageManager.classWrapper,
						className = (defaultClass || '') +' ' +(option.className||'');

					classWrapper.attr('class', option.exclusiveClassName || className);
				},0);

            	this.container.scrollTop(option.scroll || 0);
            }
		},
		/**
		 * 改变导航选中态
		 */
		changeNavStatus: function (controller, action) {
			var _self = this,
				fragment = this.fragment,
				root = spaseedConfig.root,
				navContainer = spaseedConfig.navContainer,
				navActiveClass = spaseedConfig.navActiveClass;
				
			var changeNav = function (navCollection, links) {
				navCollection.find('.' + navActiveClass).removeClass(navActiveClass);
				for (var i = 0, item; item = links[i]; i++) {
			        var href = util.getHref(item);
			        
			        if ( (href === '/' && controller === root) || (href !== '/' && fragment.indexOf(href) == 0) ) {
			          var itemParent = $(item).parent();
			          var onActiveNav = navCollection.find('.' + navActiveClass);
			          if (onActiveNav.length) {
			          	(fragment === href) && itemParent.addClass(navActiveClass);
			          } else {
			          	itemParent.addClass(navActiveClass);
			          }
			        }
			    }
			};

			var navCollection;
			for (var i=0, navcon; navcon = navContainer[i]; i++) {
				navcon = $(navcon);
				if (navCollection) {
					navCollection = navCollection.add(navcon);
				} else {
					navCollection = navcon;
				}
			}
			changeNav(navCollection, navCollection.find('a'));
		},

		/**
		 * 页面切换时全局销毁
		 */
		globalDestroy: function () {

		},
		/**
		 * 页面销毁方法的调用
		 */
		_destroy:function(){
			var replacement = false;
			if (this.currentViewObj) {
				replacement = this.currentViewObj.replacement;
				//全局销毁
				this.globalDestroy();

				//销毁前一个
				var destroy = this.currentViewObj.destroy;
                try {
				    destroy && destroy.call(this.currentViewObj);
				    if (this.currentCtrlObj) {
				    	var ctrlDestroy = this.currentCtrlObj.destroy;
				    	ctrlDestroy && ctrlDestroy.call(this.currentCtrlObj);
				    }
                } catch(e) {
                    window.console && console.error && console.error('View destroy failed ', e);
                }
                this.currentCtrlObj = null;
				this.currentViewObj = null;
			}
			return replacement;
		},

		/**
		 * 重置fragment标记(用于强制刷新controller)
		 * @method resetFragment
		 */
		resetFragment: function () {
			this.fragment = '';
		}

	};
	
	module.exports = pageManager;
});

});
