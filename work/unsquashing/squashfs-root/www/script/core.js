/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-9-5
 * Time: 下午4:17
 * To change this template use File | Settings | File Templates.
 */
void function () {
	//常量简化
	var doc = document,
		toString = Object.prototype.toString,
		slice = Array.prototype.slice;


	//命名空间，lib基础，数据，dom，动画，UI，控件
	var I = {}, L = I.lib = {}, D = I.data = {}, M = I.dom = {}, An = I.anim = {}, U = I.ui = {};
	I.widget = {};
	//版本
	L.version = "2.3.0";

	//去掉字符串两端空格
	function trim(v) {
		return (v || "").replace(/^\s+/, "").replace(/\s\s*$/, "");
	}
	D.trim = trim;

	//绑定事件方法以及参数
	function bindFun() {
		var a = slice.call(arguments), m = a.shift(), o = a.shift();
		return function () {
			return m.apply(o == null ? this : o, a.concat(slice.call(arguments)));
		}
	}
	L.bind = bindFun;

	//数据循环
	void function () {
		function push(arr, v) {
			arr.push(v);
			return v;
		}
		function append(obj, v, k) {
			obj[k] = v;
		}
		function back() {
			return arguments[1];
		}

		D.forEach = function (o, fn, exe, self) {
			if (self == null) {
				self = this;
			}
			if (o) {
				var doExe = exe ? exe.push ? push : append : back;
				if (typeof o == "object" && typeof o.length == "number" && o.length >= 0) {
					for (var i = 0; i < o.length; i += 1) {
						if (doExe(exe, fn.call(self, o[i], i), i) === false) {
							break;
						}
					}
				}
				else {
					for (n in o) {
						if (doExe(exe, fn.call(self, o[n], n), n) === false) {
							break;
						}
					}
				}
			}
			return exe || self;
		}
	} ();

	//当前脚本的script节点
	var jsNode = L.node = function (ns) {
		return ns[ns.length - 1];
	} (doc.getElementsByTagName("script"));

	//浏览器版本等
	void function (uAgent) {
		//IE 版本 非IE为 0
        L.IE = 0;
        if(!!window.ActiveXObject || "ActiveXObject" in window){
            var v = uAgent.match(/(msie|trident)[ \/]([\d.]+)/);
            if(v){
                L.IE = parseFloat(v[2]);
                if(v[1] == 'trident'){
                    L.IE += 4;
                }
            }
        }
		//Opera 版本
		L.Opera = /opera/i.test(uAgent) ? parseFloat(uAgent.match(/version\/([\d.]+)/i)[1]) : 0;
		//Firefox 版本
		L.Firefox = /firefox\/([\d.]+)/.test(uAgent) ? parseFloat(RegExp.$1) : 0;
		//chrome内核
		L.Chrome = /chrome\/([\d.]+)/.test(uAgent) ? parseFloat(RegExp.$1) : 0;
		//Safari 浏览器
		L.Safari = /version\/([\d.]+) safari\/[\d.]+/i.test(uAgent) ? parseFloat(RegExp.$1) : 0;
		//苹果内核
		L.WebKit = /applewebkit/.test(uAgent);
		//UC
//		alert(uAgent + "::×:x:X:×╳×");
//		alert(uAgent);
		L.isUC = /\d{2,5}x\d{2,5}/.test(uAgent);
//		alert(L.isUC);
//		L.isUC = true;
	} (window.navigator.userAgent.toLowerCase());

	//扩展object
	function extra(k, v) {
		if (typeof k == "string") {
			this[k] = v;
			return this;
		}
		//L.Ajax && alert(this == L.Ajax.prototype);
		var ag = slice.call(arguments), m, n;
		while (ag.length) {
			m = ag.shift();
			//alert(m.onCensor);
			for (n in m) {
				this[n] = m[n];
			}
		}
		return this;
	}
	D.extend = function () {
		return extra.apply(Array.prototype.pop.call(arguments), arguments);
	};

	//扩展this
	function extend() {
		var ag = slice.call(arguments), m;
		if (typeof this == "function") {
			this.prototype.extend = extra;
			this._inits_ = [];
			while (ag.length) {
				m = ag.shift();
				if (typeof m == "function") {
					extra.call(this, m);
					this._inits_.unshift(m);
					m = m.prototype;
				}
				extra.call(this.prototype, m);
			}
		}
		else {
			while (m = ag.shift()) {
				if (typeof m == "function") {
					try {
						m = new m();
					} catch (e) {
						m = m.prototype;
					}
				}
				extra.call(this, m);
			}
		}
		return this;
	}
	//继承与扩展
	L.extend = function () {
		return extend.apply(Array.prototype.pop.call(arguments), arguments);
	};

	//扩展自定义事件 适用于扩展在object或者类上
	L.Event = extend.call(function () { }, {
		appendEvent: function (type, fn) {
			this.__monitor || (this.__monitor = {});
			var monitor = this.__monitor;
			monitor[type] || (monitor[type] = []);
			monitor[type].push(fn);
			return this;
		},
		appendEventOne: function (type, fn) {
			this.appendEvent(type, function () {
				fn.apply(this, arguments);
				this.removeEvent(type, arguments.callee);
			});
			return this;
		},
		removeEvent: function (type, fn) {
			var monitor = this.__monitor;
			if (monitor) {
				if (fn) {
					var es = monitor[type];
					if (es) {
						for (var i = 0; i < es.length; i += 1) {
							if (es[i] == fn) {
								es.splice(i, 1);
								break;
							}
						}
					}
				}
				else {
					delete monitor[type];
				}
			}
			return this;
		},
		fireEvent: function () {
			var type = Array.prototype.shift.call(arguments),
				es = this.__monitor ? this.__monitor[type] : null,
				flag, i;
			//返回false 阻止冒泡
			if (es) {
				var m;
				for (i = 0; i < es.length; i += 1) {
					m = es[i].apply(this, arguments);
					flag !== false && (flag = m);
				}
			}

			//以下是冒泡事件
			if (flag !== false) {
				es = this.constructor.__monitor ? this.constructor.__monitor[type] : null;
				if (es) {
					for (i = 0; i < es.length; i += 1) {
						es[i].apply(this, arguments);
					}
				}
			}
			var t = "on" + type.replace(/^(\w)/, function () {
				return arguments[1].toUpperCase();
			});
			if (typeof this[t] == "function") {
				return this[t].apply(this, arguments);
			}
			return this;
		}
	});
	L.Event.appendEvent = L.Event.prototype.appendEvent;
	L.Event.removeEvent = L.Event.prototype.removeEvent;

	//添加/移除 事件
	var eventAppend = doc.addEventListener ? function (d, e, fn) {
		d.addEventListener(e, fn, false);
	} : function (d, e, fn) {
		d.attachEvent("on" + e, fn);
	};
	var eventRemove = doc.removeEventListener ? function (d, e, fn) {
		d.removeEventListener(e, fn, false);
	} : function (d, e, fn) {
		d.detachEvent("on" + e, fn);
	};
	L.appendEvent = function (d, e, fn) {
		if (d.nodeType === 1) {
			eventAppend(d, e, fn);
		}
		else {
			L.Event.appendEvent.call(d, e, fn);
		}
	};
	L.removeEvent = function (d, e, fn) {
		if (d.nodeType === 1) {
			eventRemove(d, e, fn);
		}
		else {
			L.Event.removeEvent.call(d, e, fn);
		}
	};

	//简单的Dom ID筛选
	function $(s) {
		return typeof s == "string" ? doc.getElementById(s) : s;
	}

	//节点缓存
	L.Cache = extend.call(function (prefix) {
		this.prefix = prefix || L.Cache.prefix;
		this.data = {};
	}, {
		//取得缓存
		get: function (d) {
			var id = typeof d == "string" ? d : d.id;
			return this.data[id] || null;
		},
		//添加某个节点 到缓存
		append: function (d, v) {
			var id = typeof d == "string" ? d : d.id;
			if (!id) {
				id = this.create();
				d.id = id;
			}
			this.data[id] = v;
			return this;
		},
		//移除某个缓存 返回该值
		remove: function (d) {
			var id = typeof d == "string" ? d : d.id;
			var v = this.data[id];
			delete this.data[id];
			return v;
		},
		//判断某个某个节点是否包含在内
		has: function (d) {
			var id = typeof d == "string" ? d : d.id;
			return this.data[id] ? true : false;
		},
		//创建一个 当前页面可以用的 id值 返回
		create: function () {
			var id, el;
			do {
				id = this.prefix + L.getSole();
				el = $(id);
			} while (el);
			return id;
		}
	});
	L.Cache.prefix = "_PUIAutoId_";
	L.Cache.create = L.Cache.prototype.create;

	//获得当前网页的唯一值
	var soleCount = 0;
	L.getSole = function () {
		var key = soleCount = (soleCount || 0) + 1,
			fix = Math.round(Math.random() * 26 + 10).toString(36);
		return fix + key;
	};

	//当前核心js的网站路径
	L.path = jsNode.src.split(/\?/)[0].replace(/[^\/]*$/, "");

	//Dom加载完毕
	void function () {
		//domReady
		var ready = function () {
			//dom ready函数
			for (var i = 0; i < readyArr.length; i += 1) {
				readyExe.apply(L, readyArr[i]);
			}
			ready = null;
			L.onReady = readyExe;
		};

		function readyExe() {
			var ag = slice.call(arguments);
			setTimeout(function () {
				ag.shift().apply(ag.shift() || L, ag);
			});
			return L;
		}

		//在ready之前就放入缓存
		var readyArr = [];
		//加入DOMContentLoaded事件
		doc.attachEvent ? doc.attachEvent("onreadystatechange", function () {
			if (doc.readyState == "complete" || doc.readyState == "loaded") {
				ready();
			}
		}) : doc.addEventListener("DOMContentLoaded", ready, false);
		//存入临时
		L.onReady = function () {
			readyArr.push(arguments);
			return L;
		}
	} ();

	//异步脚本加载器
	void function () {
		//已经加载完毕的js
		var jsLoaded = {};

		//进栈
		function stackPush(urls, callBack, charset) {
			callBack && this.backs.push(callBack);
			if (typeof urls == "string") {
				this.jss.push([urls, stackShift, charset]);
			}
			else {
				for (var i = 0; i < urls.length; i += 1) {
					this.jss.push([urls[i], stackShift, charset]);
				}
			}
			if (this.flag == 0) {
				this.flag = 1;
				stackShift.call(this);
			}
		}

		//出栈
		function stackShift() {
			if (this.jss.length) {
				disorderJS.apply(this, this.jss.shift());
				return;
			}
			if (this.backs.length) {
				this.backs.pop().call(this);
				stackShift.call(this);
				return;
			}
			this.flag = 0;
		}

		//加载script脚本
		function loadJS(url, callBack, charset) {
			//alert(url);
			var t = doc.createElement("script");
			t.setAttribute("type", "text/javascript");
			charset && t.setAttribute("charset", charset);
			t.onreadystatechange = t.onload = t.onerror = function () {
				if (!t.readyState || t.readyState == 'loaded' || t.readyState == 'complete') {
					t.onreadystatechange = t.onload = t.onerror = null;
					t = null;
					//防止回调的时候，script还没执行完毕
					callBack && setTimeout(function () {
						callBack();
					}, 100);
				}
			};
			t.src = url;
			doc.getElementsByTagName("head")[0].appendChild(t);
		}
		function requireJS(src, callBack, charset) {
			var url, self = this;
			url = src.replace(/^\.\//, this.path || L.path);
			if (!/\.[^\/]+$/.test(url)) {
				url += ".js";
			}
			if (jsLoaded[url]) {
				setTimeout(function () {
					callBack.call(self, src);
				}, 100);
				return;
			}
			loadJS(url, function () {
				jsLoaded[url] = true;
				callBack.call(self, src);
			}, charset);
		}

		//无序下载
		function disorderJS(urls, callBack, charset) {
			if (typeof urls == "string") {
				requireJS.call(this, urls, callBack, charset);
				return L;
			}
			var led = {};

			function loadBack(src) {
				delete led[src];
				for (var n in led) {
					return;
				}
				callBack.call(this);
			}

			for (var i = 0; i < urls.length; i += 1) {
				led[urls[i]] = true;
				requireJS.call(this, urls[i], loadBack, charset);
			}
			return L;
		}

		L.chain = L.extend({
			require: function () {
				var ag = slice.call(arguments), l = ag.length;
				if (l == 1) {
					stackPush.call(this, ag[0]);
					return this;
				}
				l -= 1;
				if (typeof ag[l] == "function") {
					stackPush.call(this, ag.slice(0, l), ag[l]);
					return this;
				}
				l -= 1;
				if (ag[l] == null || typeof ag[l] == "function") {
					stackPush.call(this, ag.slice(0, l), ag[l], ag[l + 1]);
					return this;
				}
				stackPush.call(this, ag);
				return this;
			}
		}, function (path) {
			this.flag = 1;
			this.jss = [];
			this.backs = [];
			this.path = path;
			L.onReady(function () {
				//出栈操作
				stackShift.call(this);
			}, this);
		});
		var reone = new L.chain();
		L.require = bindFun(reone.require, reone);

		//防止在重复加载
		L.required = function (src) {
			jsLoaded[src] = true;
		};

		//最简单的加载js方法 jspnp使用
		L.loadJS = loadJS;
	} ();

	//基础数据转换
	//json字符串转Object 安全转换
	D.parseJSON = function (str) {
		if (!str) {
			return null;
		}
		//验证json字符串的安全性
		if (/^[\],:{}\s]*$/.test(str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
			try {
				return eval("(" + str + ")");
			} catch (e) {
				return null;
			}
		}
		return null;
	};

	//将字符串转XML
	D.parseXML = window.DOMParser ? function (str) {
		var xml = new DOMParser().parseFromString(str, "text/xml");
		//火狐加载失败的时候 会生成一个特定的错误xml
		return xml.documentElement.tagName != "parsererror" ? xml : null;
	} : function (str) {
		var xml = new ActiveXObject("Microsoft.XMLDOM");
		try {
			var flg = xml.loadXML(str);
			return flg ? xml : null;
		} catch (e) {
		}
		return null;
	};

	//获取网页地址后面的参数
	void function () {
		function get(str) {
			var data = {};
			D.forEach(str.replace(/^[\s#\?&]+/, "").replace(/&+/, "&").split(/&/), function (v) {
				var s = v.split("=");
				if (s[0] != "") {
					s[1] = decodeURIComponent(s[1] || "");
					if (data[s[0]] == null) {
						data[s[0]] = s[1];
					}
					else if (data[s[0]].push) {
						data[s[0]].push(s[1]);
					}
					else {
						data[s[0]] = [data[s[0]], s[1]];
					}
				}
			});
			return data;
		}
		var iData = {};
		D.parseURI = function (str) {
			if (iData[str]) {
				return iData[str];
			}
			return iData[str] = get(str);
		};
	} ();

	D.stringifyURI = function (obj, k) {
		var rv = [];
		D.forEach(obj, function (m, n) {
			if (toString.call(m) === "[object Array]") {
				for (var i = 0; i < m.length; i += 1) {
					rv.push(n + "=" + encodeURIComponent(m[i]));
				}
			}
			else {
				rv.push(n + "=" + encodeURIComponent(m));
			}
		});
		return rv.join(k || "&");
	};

	//基础Ajax
	void function () {
		//创建XHR
		var createXHR = window.XMLHttpRequest ? function () {
			return new window.XMLHttpRequest();
		} : function () {
			return new ActiveXObject("Microsoft.XMLHTTP");
		};
		//XHR 发送数据
		function requestSend(param, header) {
			var xhr = this.XHR = createXHR();
			//头处理
			header = extra.call({}, this.header, header || {});

			//参数处理
			var paramStr = null, isFormData = this.isFormData || (window.FormData && param instanceof window.FormData);
			if (typeof param == "string" || isFormData) {
				paramStr = param;
			}
			else if (param) {
				paramStr = D.stringifyURI(param, "&");
			}

			//Open
			this.fireEvent("open");
			if (this.method == "GET") {
				//请求
				var url = this.url;
				if (paramStr && !isFormData) {
					url += (url.indexOf("?") > -1 ? "&" : "?") + paramStr;
					paramStr = null;
				}
				xhr.open(this.method, url, this.async);
			}
			else {
				xhr.open(this.method, this.url, this.async);
				if (header["Content-Type"] == null && !isFormData) {
					this.XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					if (paramStr) {
						paramStr = paramStr.replace(/[\x00-\x08\x11-\x12\x14-\x20]/g, "*");
					}
				}
			}
			D.forEach(header, function (v, k) {
				xhr.setRequestHeader(k, v);
			});

			//发送请求
			if (this.async) {
				xhr.onreadystatechange = this._requestChange;
			}
			try {
				xhr.upload.onprogress = this._progress;
				xhr.onprogress = this._progress;
			} catch (e) { }
			this.fireEvent("send");
			xhr.send(paramStr);
			return this;
		}

		//ajax进度
		function onprogress(event) {
			//alert(event.lengthComputable + "::" + event.loaded + "::" + event.total);
			this.fireEvent("progress", event);
		}

		function onHttpRequestChange() {
			var xhr = this.XHR;
			this.readyState = xhr.readyState;
			this.fireEvent("requestChange");
			if (xhr.readyState == 4) {
				if (!this.overFlag) {
					this.responseHeaders = xhr.getAllResponseHeaders();
					try {
						this.responseText = xhr.responseText;
					} catch (e) {
						this.responseText = "";
					}
					var isxml = xhr.responseXML && xhr.responseXML.documentElement ? true : false;
					this.responseXML = isxml ? D.parseXML(this.responseText) || xhr.responseXML : null;
					this.responseJSON = isxml ? null : D.parseJSON(this.responseText);
					this.status = xhr.status;
					var end = this.fireEvent("complete");
					if (end !== false) {
						var back = this.fireEvent("censor");
						this.error = back === true ? null : back;
						this.fireEvent("callBack");
						this.fireEvent(this.error ? "fail" : "success");
					}
				}
				delete this.XHR;
				delete this.overFlag;
				return null;
			}
			return null;
		}

		L.Ajax = extend.call(function () {
			this.header = {
				"If-Modified-Since":"0",
				"Cache-Control":"no-cache"
			};
			this.url = "";
			this.method = "GET";
			this.async = true;
			//XMLHttpRequest 改变调用
			this._requestChange = bindFun(onHttpRequestChange, this);
			this._progress = bindFun(onprogress, this);
			if (arguments.length) {
				this.open.apply(this, arguments);
			}
		}, L.Event, {
			onCensor: function () {
				var s = this.status;
				if (!this.timeout && s >= 200 && s < 300 || s === 304 || s === 1223) {
					return true;
				}
				return "no data back,please try it later...";
			},
			//ajax中中止
			abort: function () {
				if (this.XHR) {
					this.XHR.abort();
				}
				return this;
			},
			//发送数据
			send: function (param, header, over) {
				if(this.XHR) {
					if (this.XHR.readyState == 4 || !over) {
						return this;
					}
					this.overFlag = true;
					this.XHR.abort();
					this.XHR = null;
				}
				if (this.async) {
					setTimeout(bindFun(requestSend, this, param, header));
				}
				else {
					requestSend.call(this, param, header);
				}
				return this;
			},
			//获得response头
			getResponseHeader: function (key) {
				return key ? this.responseHeaders && new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(this.responseHeaders) ? RegExp["$1"] : "" : (this.responseHeaders || "");
			},
			//设置头
			setRequestHeader: function (k, v) {
				this.header[k] = v;
				return this;
			},
			open: function (url, method, async) {
				if (url) {
					this.url = url;
				}
				if (method) {
					this.method = method;
				}
				if (async != null) {
					this.async = !!async;
				}
			}
		});
	} ();

	//Dom筛选 简单
	M.get = function () {
		//#a[2,t]x 多ID筛选
		var siftExpIds = /^#([\w\u00c0-\uFFFF\-]*)\[([\w\-,]+)\]([\w\u00c0-\uFFFF\-]*)/,
		//ID筛选
			siftExpId = /^(?:#([\w\u00c0-\uFFFF\-]+))?([ >]*)/,
		//Name筛选
			siftExpName = /^\[name=([\w\u00c0-\uFFFF\-]+)\]/,
		//tag筛选
			siftExpTag = /^([a-zA-Z]+[a-zA-Z:]*|\*)/,
		//样式筛选
			siftExpClass = /^\.([\w\u00c0-\uFFFF\-]+)/,
		//属性筛选
			siftExpAtt = /^\[([\w\u00c0-\uFFFF\-]+)([\^!\$\*]*=)*([\w\u00c0-\uFFFF\-]*)\]/,
		//自定义筛选
			siftExpCus = /^:([\w:\(\),]+)/;
		//筛选器
		function Sift(selector, context) {
			var rv = [], flag;
			//ids 筛选 #ttp[1,2,3]xx
			selector = trim(selector).replace(siftExpIds, function ($0, q, c, h) {
				var rx = c.split(/[\s*,\s*]/), o = rv.$ = {};
				for (var i = 0; i < rx.length; i += 1) {
					rv.push(o[rx[i]] = $(q + rx[i] + h));
				}
				flag = true;
				return "";
			});
			if (flag) {
				return rv;
			}
			//name [name=]
			selector = trim(selector).replace(siftExpName, function ($0, name) {
				var r = doc.getElementsByName(name);
				r.length && Sift.filterArray(r, null, rv);
				flag = true;
				return "";
			});
			if (flag) {
				return rv;
			}
			//id 单个Id筛选
			var ex = " ";
			selector = selector.replace(siftExpId, function ($0, id, e) {
				ex = !id || e ? e.indexOf(">") > -1 ? ">" : " " : "";
				if (id) {
					context = $(id);
				}
				return "";
			});
			if (ex == "") {
				return context ? [context] : [];
			}
			var filter = {};
			selector = selector.replace(siftExpTag, function ($0, tag) {
				if (tag && tag != "*") {
					filter.tag = [tag];
				}
				return "";
			});
			if (ex == ">") {
				rv = (context || doc.body).childNodes;
			}
			else {
				rv = (context || doc).getElementsByTagName(filter.tag ? filter.tag[0] : "*");
				delete filter.tag;
			}
			selector = selector.replace(siftExpClass, function ($0, className) {
				filter.className = [className];
				return "";
			});
			selector = selector.replace(siftExpAtt, function ($0, key, compare, val) {
				filter.att = [key, compare, val];
				return "";
			});
			selector.replace(siftExpCus, function ($0, cus) {
				var cs = cus.split(":"), i = 0, m, re = /^(\w+)(?:\(([\w,]*)\))?$/;
				for (; i < cs.length; i += 1) {
					(m = cs[i].match(re)) && (filter[m[1]] = m[2].split(","));
				}
				return "";
			});
			return Sift.filterArray(rv, filter);
		}

		/**
		 * 筛选 转换为数组
		 * @param array
		 * @param filters
		 */
		Sift.filterArray = function (array, filters, rv) {
			rv || (rv = []);
			var i = 0, len = array.length, flag;
			for (; i < len; i += 1) {
				if (array[i].nodeType == 1) {
					flag = true;
					D.forEach(filters, function (v, n) {
						if (!Sift.filter[n].apply(array[i], v)) {
							return flag = false;
						}
					});
					flag && rv.push(array[i]);
				}
			}
			return rv;
		};
		/**
		 * 删选器
		 */
		Sift.filter = {
			/**
			 * 标签筛选
			 * @param tag
			 */
			tag: function (tag) {
				return this.tagName == tag.toLocaleUpperCase();
			},
			/**
			 * class筛选
			 * @param className
			 */
			className: function (className) {
				return (" " + this.className + " ").indexOf(" " + className + " ") > -1;
			},
			/**
			 * 属性筛选
			 * @param key
			 * @param compare
			 * @param val
			 */
			att: function (key, compare, val) {
				var att = this[key] != null ? this[key] : this.getAttribute(key);
				switch (compare || "") {
					case "":
						return att != null;
					case "=":
						return att == val;
					case "!=":
						return att != val;
					case "^=":
						return att.indexOf(val) == 0;
					case "$=":
						return att.slice(val.length * -1) == val;
					case "*=":
						return att.indexOf(val) > -1;
				}
				return false;
			}
		};
		return Sift;
	} ();

	//将Dom产生的事件自动获取 并格式化
	//部分移动事件属性需要增加或者转移
	M.getEvent = function (ev) {
		ev = ev || window.event || function (gs) {
			return gs[gs.length - 1];
		} (arguments.callee.caller.arguments);
		if (!ev) {
			return null;
		}
		if(ev.clientX == null){
			if(ev.targetTouches && ev.targetTouches[0]){
				ev.clientX = ev.targetTouches[0].clientX;
				ev.clientY = ev.targetTouches[0].clientY;
			}
			else if(ev.changedTouches && ev.changedTouches[0]){
				ev.clientX = ev.changedTouches[0].clientX;
				ev.clientY = ev.changedTouches[0].clientY;
			}
		}
		ev.charCode == null && (ev.charCode = (ev.type == "keypress") ? ev.keyCode : 0);
		ev.eventPhase == null && (ev.eventPhase = 2);
		ev.isChar == null && (ev.isChar = ev.charCode > 0);
		ev.pageX == null && (ev.pageX = ev.clientX + doc.body.scrollLeft);
		ev.pageY == null && (ev.pageY = ev.clientY + doc.body.scrollTop);
		ev.preventDefault == null && (ev.preventDefault = function () {
			this.returnValue = false;
		});
		ev.stopPropagation == null && (ev.stopPropagation = function () {
			this.cancelBubble = true;
		});
		ev.target == null && (ev.target = ev.srcElement);
		ev.time == null && (ev.time = new Date().getTime());

		if (ev.relatedTarget == null && (ev.type == "mouseout" || ev.type == "mouseleave")) {
			ev.relatedTarget = ev.toElement;
		}
		if (ev.relatedTarget == null && (ev.type == "mouseover" || ev.type == "mouseenter")) {
			ev.relatedTarget = ev.fromElement;
		}
		if (ev.type == "mousewheel" || ev.type == "DOMMouseScroll") {
			if (ev.wheelDelta == null) {
				ev.wheelDelta = ev.detail * -40;
			}
			ev.wheelDeltaFlg = ev.wheelDelta < 0;
		}
		return ev;
	};

	//动态创建多节点
	var domCache = {};
	M.create = function (t, b, h, y) {
        var rv;
        //制造节点
        if(typeof t == "string"){
            if(b == "text"){
                rv = doc.createTextNode(t);
                y = h;
            }
            else{
                b = b || {};
                t = t.toLowerCase();
                //IE中的只读属性
                if(L.IE && L.IE < 9 && (b.name || b.checked || b.hidefocus)){
                    t = '<' + t;
                    if(b.name){
                        t = t + ' name="' + b.name + '"';
                        delete b.name;
                    }
                    if(b.checked){
                        t = t + ' checked="checked"';
                        delete b.checked;
                    }
                    if(b.hidefocus){
                        t = t + ' hidefocus="true"';
                        delete b.hidefocus;
                    }
                    t = t + " >";
                }
                if(!domCache[t]){
                    domCache[t] = doc.createElement(t);
                }
                rv = domCache[t].cloneNode(false);
                if(typeof h == "string" || typeof h == "number"){
                    rv.innerHTML = h;
                }
                else if(toString.call(h) == "[object Array]"){
                    M.create(h,rv);
                }
                //设置属性
                M.attr(rv, b);
            }
        }
        else if(toString.call(t) == "[object Array]"){
            if(typeof t[0] == "string"){
                rv = M.create.apply(M,t);
            }
            else{
                rv = [];
                for(var i = 0; i < t.length; i += 1){
                    rv.push(M.create.apply(M,t[i]));
                }
            }
            y = b;
        }
        //加入
        y && M.append(y, rv);
        return rv;
	};

	//Dom 设置CSS
	M.css = function (d, k, v) {
		if (typeof k == "string") {
			if (k == "opacity") {
				return M.opacity(d, v);
			}
			k = k.replace(/\-([a-z])/g, function () {
				return arguments[1].toUpperCase();
			});
			if (v == null) {
				return d.style[k] || (d.currentStyle ? d.currentStyle[k] : d.ownerDocument.defaultView.getComputedStyle(d, null)[k]);
			}
			d.style[k] = v;
			return this;
		}
		D.forEach(k, function (v, n) {
			M.css(d, n, v);
		});
		return this;
	};

	//设置透明度
	M.opacity = L.IE && L.IE < 9 ? function (d, v) {
		var ropacity = /opacity=([^)]*)/, ralpha = /alpha\([^)]*\)/, style = d.style, filter;
		if (v == null) {
			filter = style.filter || d.currentStyle.filter || "";
			return filter && filter.indexOf("opacity=") >= 0 ? parseFloat(ropacity.exec(style.filter)[1]) / 100 : 1;
		}
		var opacity = parseInt(v, 10) + "" === "NaN" ? "" : "alpha(opacity=" + v * 100 + ")";
		filter = style.filter || "";
		style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : opacity;
		return this;
	} : function (d, v) {
		if (v == null) {
			v = (d.style || d.currentStyle || d.ownerDocument.defaultView.getComputedStyle(d, null)).opacity;
			return v == "" ? 1 : v;
		}
		d.style.opacity = v;
		return this;
	};

	//CSS实际宽度
	void function () {
		//设置新的CSS属性，并把老的CSS属性返回
		function cssSwap(d, op) {
			var old = {};
			D.forEach(op, function (v, n) {
				old[n] = M.css(d, n);
				M.css(d, n, v);
			});
			return old;
		}

		//获取宽 高数据
		function getDomWH(d, t, c, a) {
			var v = d["offset" + t];
			if (v == 0) {
				var old = cssSwap(d, { position: "absolute", visibility: "hidden", display: "block" });
				v = d["offset" + t];
				cssSwap(d, old);
			}
			var i;
			if (c) {
				for (i = 0; i < c.length; i += 1) {
					v -= parseFloat(M.css(d, c[i])) || 0;
				}
			}
			if (a) {
				for (i = 0; i < a.length; i += 1) {
					v += parseFloat(M.css(d, a[i])) || 0;
				}
			}
			return v;
		}

		//CSS实际宽度
		M.width = function (d, v) {
			if (v == null) {
				v = M.css(d, "width");
				if (v && /px$/.test(v)) {
					return parseInt(v) || 0;
				}
				return getDomWH(d, "Width", ["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]);
			}
			d.style.width = typeof v == "number" ? v + "px" : v;
			return this;
		};
		//CSS实际高度
		M.height = function (d, v) {
			if (v == null) {
				v = M.css(d, "height");
				if (v && /px$/.test(v)) {
					return parseInt(v) || 0;
				}
				return getDomWH(d, "Height", ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"]);
			}
			d.style.height = typeof v == "number" ? v + "px" : v;
			return this;
		};
		// 获取某个节点的 left top width heiget 属性
		M.offset = function (d, sl) {
			var r = {}, ds = d.style.display, old;
			if (ds == "none") {
				old = cssSwap(d, { position: "absolute", visibility: "hidden", display: "block" });
			}
			if (sl != 2) {
				r.left = 0;
				r.top = 0;
				if (d.getBoundingClientRect) {
					var box = d.getBoundingClientRect(),
						body = doc.body,
						docEl = doc.documentElement,
						clientTop = docEl.clientTop || body.clientTop || 0,
						clientLeft = docEl.clientLeft || body.clientLeft || 0,
						zoom = 1;
					if (body.getBoundingClientRect) {
						var bound = body.getBoundingClientRect();
						zoom = (bound.right - bound.left) / body.clientWidth;
					}
					if (zoom > 1) {
						clientTop = 0;
						clientLeft = 0;
					}
					r.top = box.top / zoom + (window.pageYOffset || docEl && docEl.scrollTop / zoom || body.scrollTop / zoom) - clientTop;
					r.left = box.left / zoom + (window.pageXOffset || docEl && docEl.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;
				}
				else {
					var e = d;
					while (e.offsetParent) {
						r.left += (e.offsetLeft - e.scrollLeft);
						r.top += (e.offsetTop - e.scrollTop);
						e = e.offsetParent;
					}
				}
			}
			if (sl != 1) {
				r.width = d.offsetWidth;
				r.height = d.offsetHeight;
			}
			if (old) {
				cssSwap(d, old);
			}
			return r;
		};
	} ();

	//切换样式
	M.toggleClass = function (d, v, f) {
		v = trim(v);
		if (!v) {
			return this;
		}
		if (f && !d.className) {
			d.className = v;
			return this;
		}
		if (f === false && !d.className) {
			return this;
		}
		var cn = " " + trim(d.className).replace(/\s+/g, " ") + " ", p = v.split(/\s+/);
		for (var i = 0; i < p.length; i += 1) {
			if (cn.indexOf(" " + p[i] + " ") >= 0) {
				if (!f) {
					cn = cn.replace(" " + p[i] + " ", " ");
				}
			}
			else {
				if (f || f == null) {
					cn += (p[i] + " ");
				}
			}
		}
		d.className = trim(cn);
		return this;
	};
	//增加Class
	M.addClass = function (d, v) {
		M.toggleClass(d, v, true);
		return this;
	};
	//移除Class
	M.removeClass = function (d, v) {
		M.toggleClass(d, v, false);
		return this;
	};
	//获得 HTML 或者设置HTML
	M.html = function (d, v) {
		if (v == null) {
			return d.innerHTML.replace(/\s*[iI][dD]=(['"]*)_PUIAutoId_\w+\1\s*/g, " ");
		}
		d.innerHTML = v;
		return this;
	};
	//获得 HTML 或者设置HTML
	var domText = L.IE ? "innerText" : "textContent";
	M.text = function (d, v) {
		if (v == null) {
			return d[domText];
		}
		d[domText] = v;
		return this;
	};

	//清空字节点
	M.clear = function (d) {
		while (d.childNodes.length) {
			d.removeChild(d.lastChild);
		}
		return this;
	};
	//添加字节点
	M.append = function (d, v) {
		d = $(d);
		if (toString.call(v) == "[object Array]") {
			for (var i = 0; i < v.length; i += 1) {
				M.append(d, v[i]);
			}
			return this;
		}
		d.appendChild(v);
		return this;
	};

	//Dom事件
	void function () {
		var eventKeyDown = M.keypressConfig = {
			vkeyenter: 13,
			vkeybackspace: 8,
			vkeyspace: 32,
			vkeydel: 46,
			vkeyleft: 37,
			vkeyup: 38,
			vkeyright: 39,
			vkeydown: 40,
			vkeyesc:27
		};

		//虚拟事件
		var vEvent = M.vEvents = {}, exEvent = M.exEvents = [];
		//使得 火狐有 mousewheel mouseenter mouseleave 事件 以及 添加 keyenter事件
		function eventCut(e, fn, f) {
			//虚拟事件，需要转移只实体事件
			if (vEvent[e]) {
				return vEvent[e](fn, f);
			}

			//按键事件
			var ee;
			if (eventKeyDown[e]) {
				if (!fn) {
					return "keydown";
				}
				ee = "_PUI_Event_" + e + "_";
				if (f && !fn[ee]) {
					fn[ee] = function (ev) {
						var keyfun = eventKeyDown[e], key = (ev || window.event).keyCode;
						if (typeof keyfun == "function" && keyfun(key)) {
							return fn.call(this, ev);
						}
						if (keyfun == key) {
							return fn.call(this, ev);
						}
					}
				}
				return ["keydown", fn[ee] || fn];
			}

			if (!L.IE && (e == "mouseenter" || e == "mouseleave")) {
				if (!fn) {
					return e == "mouseenter" ? "mouseover" : "mouseout";
				}
				ee = "_PUI_Event_mouse_el_";
				if (f && fn[ee] == null) {
					fn[ee] = function (ev) {
						var t = ev.relatedTarget;
						if (t && !(t.compareDocumentPosition(this) & 8)) {
							fn.call(this, ev);
						}
					}
				}
				return [e == "mouseenter" ? "mouseover" : "mouseout", fn[ee] || fn];
			}

			//alert(L.Firefox + "::" + e);
			if(L.Firefox && e == "mousewheel") {
				return fn ? ["DOMMouseScroll", fn] : "DOMMouseScroll";
			}

			//泛累虚拟事件
			for (var i = 0; i < exEvent.length; i += 1) {
				ee = exEvent[i](e, fn, f);
				if (ee) {
					return ee;
				}
			}

			return fn ? [e, fn] : e;
		}

		//通过M.bind加入的事件，都会在这里留下缓存
		var eventCache = new L.Cache();
		//对缓存的处理
		function eventHandle(d, e, f, fn, a) {
			if (f) {//加入
				var data;
				if (eventCache.has(d)) {
					data = eventCache.get(d);
				}
				else {
					data = [];
					eventCache.append(d, data);
				}
				a.unshift(d);
				a.unshift(fn);
				var m = bindFun.apply(d, a);
				data.push([e, fn, m]);
				return m;
			}
			else {
				var rv = [];
				if (eventCache.has(d)) {
					var c = eventCache.get(d);
					for (var i = 0; i < c.length; ) {
						if (c[i][0] == e && (fn == null || (fn && c[i][1] == fn))) {
							rv.push(c[i][2]);
							c.splice(i, 1);
						}
						else {
							i += 1
						}
					}
				}
				return rv;
			}
		}

		//设置节点的属性
		void function () {
			//非IE下设置某些特殊属性 转义 以及节点缓存
			var domAttName = {
				className: "class",
				htmlFor: "for"
			};
			M.attr = function (d, k, v) {
				if (typeof k == "string") {
					//转义
					if (!L.IE && domAttName[k]) {
						k = domAttName[k]
					}
					//取值
					if (v == null) {
						return k == "style" ? d.style.cssText : (d[k] || d.getAttribute(k));
					}
					if (k == "style") {//样式
						typeof v == "string" ? d.style.cssText = v : M.css(d, v);
						return this;
					}
                    if(typeof v == "function" && (/^on/.test(k) || eventKeyDown[k] || vEvent[k])){
                        var f = eventCut(eventKeyDown[k] || vEvent[k]?k:k.replace(/^on/, ""), v, true);
                        d["on" + f[0]] = f[1];
                        return this;
                    }
					if (k == "className" || typeof v == "function") {
						d[k] = v;
						return this;
					}
					if (v === false) {
						d.removeAttribute(k);
						return this;
					}
					d.setAttribute(k, v);
					return this;
				}
				D.forEach(k, function (v, n) {
					M.attr(d, n, v);
				});
				return this;
			};
		} ();
		//增加普通事件
		M.appendEvent = function (d, e, fn) {
			var f = eventCut(e, fn, true);
			eventAppend(d, f[0], f[1]);
			return this;
		};
		//移除普通事件
		M.removeEvent = function (d, e, fn) {
			var f = eventCut(e, fn);
			eventRemove(d, f[0], f[1]);
			return this;
		};
		//手动触发事件 获赠增加属性事件
		M.on = function (d, e, fn) {
			if (typeof fn == "function") {
				var f = eventCut(e, fn, true);
				d["on" + f[0]] = f[1];
				return this;
			}
			var v = e || "click", ev;
			if (doc.createEvent) {
				ev = doc.createEvent('HTMLEvents');
				ev.initEvent(eventCut(v), true, true);
				if (fn) {
					extra.call(ev, fn);
				}
				d.dispatchEvent(ev);
			}
			else if (doc.createEventObject) {
				ev = doc.createEventObject();
				if (fn) {
					extra.call(ev, fn);
				}
				d.fireEvent('on' + eventCut(v), ev);
			}
			return this;
		};
		// 添加事件
		M.bind = function (d, e, f) {
			var v = eventCut(e, f, true),
				m = eventHandle(d, e, true, v[1], slice.call(arguments, 3));
			eventAppend(d, v[0], m);
			return this;
		};
		//移除事件
		M.unbind = function (d, e, f) {
			var v = f ? eventCut(e, f, false) : [eventCut(e, f, false), null],
				n = eventHandle(d, e, false, v[1]);
			for (var i = 0; i < n.length; i += 1) {
				eventRemove(d, v[0], n[i]);
			}
			return this;
		};
	} ();

	//对dom数组中的方法封装
	M.expand = {
		//不破坏当前this，生成新的对象 返回
		get: function (i) {
			if (typeof i == "number") {
				return extra.call([this[i]], M.expand);
			}
			for (var n = 0, nl = this.length, r = [], o = {}, m; n < nl; n += 1) {
				m = eval(i);
				if (this[m] && !o[m]) {
					r.push(o[m] = this[m]);
				}
			}
			return extra.call(r, M.expand);
		},
		//在当前对象数组中删除部分元素 返回本身
		wipe: function (i) {
			for (var n = 0, nl = this.length; n < nl; n += 1) {
				this[eval(i)] = null;
			}
			for (n = 0; n < nl; ) {
				if (this[n]) {
					n += 1;
				}
				else {
					this.splice(n, 1);
				}
			}
			return this;
		},
		//迭代
		forEach: function () {
			var fn = arguments[0];
			for (var i = 0; i < this.length; i += 1) {
				arguments[0] = i;
				if (fn.apply(this[i], arguments) === false) {
					break;
				}
			}
			return this;
		},
		//取值函数
		val: function () {
			var v = [], radio = true, rv, ckBox = true, cv = [], nn, tt;
			for (var i = 0; i < this.length; i += 1) {
				v.push(trim(this[i].value || this[i].getAttribute("value") || ""));
				nn = this[i].nodeName.toUpperCase();
				tt = this[i].type.toUpperCase();
				if (radio) {
					radio = nn == "INPUT" && tt == "RADIO";
					if (radio) {
						ckBox = false;
						if (this[i].checked) {
							rv = this[i].value;
						}
					}
				}
				if (ckBox) {
					ckBox = nn == "INPUT" && tt == "CHECKBOX";
					if (ckBox && this[i].checked) {
						cv.push(this[i].value);
					}
				}
			}
			return radio ? rv : ckBox ? cv : v;
		}
	};
	//继续扩展
	D.forEach(["attr", "css", "opacity", "width", "height", "html", "text", "clear", "offset", "bind", "unbind", "appendEvent", "removeEvent", "on", "addClass", "removeClass", "toggleClass"], function (type) {
		M.expand[type] = function () {
			Array.prototype.unshift.call(arguments, null);
			for (var i = 0, len = this.length, ks = []; i < len; i += 1) {
				arguments[0] = this[i];
				ks[i] = M[type].apply(this, arguments);
			}
			return ks[0] == this ? this : ks;
		};
	});
	//获得单节点
	M.getId = function (s, fn) {
		s = $(s);
		return typeof fn == "function" ? fn.call(s || false) : s;
	};
	//多节点查询，并附加方法
	M.query = function (els) {
		return extra.call(typeof els == "string" ? M.get(els) : toString.call(els) == "[object Array]" ? els : [els], M.expand);
	};

	//动画基础
	void function () {
		//动画帧率 默认50
		An.FPS = 50;
		//动画默认算法
		An.rule = "cos";
		//动画开始的时候 计算各方面的初始值
		An.initial = {
			//一般CSS属性
			natural: function (d, n, m, arr, mx, un, sp, ed, ng) {
				var val = M.css(d, n),
					unx = val.replace(/[\d\-.]|auto/g, "");
				arr[n] = unx == "" && (n == "width" || n == "height") ? D[n](d) : (parseInt(val) || 0);
				var end = ed ? m : arr[n] + m;
				mx[n] = (ng || end >= 0 ? end : 0) - arr[n];
				un[n] = unx || "px";
				return sp > 10 ? sp : Math.abs(mx[n] * sp);
			},
			//透明度
			opacity: function (d, m, arr, mx, un, sp, ed) {
				var n = "opacity", val = M.css(d, n);
				arr[n] = parseFloat(val) || 0;
				var end = ed ? m : arr[n] + m;
				mx[n] = end <= 0 ? 0 - arr[n] : end > 1 ? 1 - arr[n] : m;
				un[n] = "";
				return sp > 200 ? sp : Math.abs(mx[n] * sp * 400);
			}
		};
		//执行过程
		An.execution = {
			//CSS值设置 默认值无负数
			natural: function (d, n, r, s, t, u) {
				var v = Math.max(r * t + s, 0) + u;
				M.css(d, n, v);
				return v;
			},
			//透明度设置 无单位
			opacity: function (d, r, s, t) {
				var v = r * t + s;
				M.css(d, "opacity", v);
				return v;
			}
		};
		//复制 负值的属性
		D.forEach(["marginLeft", "marginRight", "marginTop", "marginBottom", "top", "left", "bottom", "right"], function (n) {
			An.initial[n] = function (d, m, arr, mx, un, sp, ed) {
				return An.initial.natural(d, n, m, arr, mx, un, sp, ed, true);
			};
			An.execution[n] = function (d, r, s, t, u) {
				var v = r * t + s + u;
				M.css(d, n, r * t + s + u);
				return v;
			};
		});
		//动画规则 要使用更多 效果 请加载 AnimRules.js 所有设置的 请返回 总长的百分比
		An.rules = {
			cos: function (t, d) {
				return (-Math.cos(t / d * Math.PI) / 2) + 0.5;
			},
			linear: function (t, d) {
				return t / d;
			}
		};
		//获得Color值 数组 支持 #FFF #FFFFFF rgb(1,2,3)
		function getAnimColor(str) {
			var color = str.match(/^#?(-?)(\w{1})(-?)(\w{1})(-?)(\w{1})$/);
			if (color && color.length == 7) {
				return [parseInt(color[1] + color[2] + color[2], 16), parseInt(color[3] + color[4] + color[4], 16), parseInt(color[5] + color[6] + color[6], 16)];
			}
			color = str.match(/^#?(-?\w{2})(-?\w{2})(-?\w{2})$/);
			if (color && color.length == 4) {
				return [parseInt(color[1], 16), parseInt(color[2], 16), parseInt(color[3], 16)];
			}
			color = str.match(/^rgb\((-?\d{1,3}),\s*(-?\d{1,3}),\s*(-?\d{1,3})\)$/);
			if (color && color.length == 4) {
				return [parseInt(color[1], 10), parseInt(color[2], 10), parseInt(color[3], 10)];
			}
			return [255, 255, 255];
		}

		//颜色数值属性设置
		D.forEach(["backgroundColor", "color", "borderColor", "borderLeftColor", "borderRightColor", "borderTopColor", "borderBottomColor"], function (n) {
			An.execution[n] = function (d, r, s, t) {
				for (var i = 0, h = [], v; i < 3; i += 1) {
					v = r * t[i] + s[i];
					h[i] = (v >= 0 ? v <= 255 ? Math.round(Math.abs(v)) : 255 : 0);
				}
				v = "rgb(" + h.join(",") + ")";
				M.css(d, n, v);
				return v;
			};
			An.initial[n] = function (d, m, arr, mx, un, sp, ed) {
				arr[n] = getAnimColor(M.css(d, n));
				m = getAnimColor(m);
				mx[n] = [];
				for (var i = 0, end; i < 3; i += 1) {
					end = ed ? m[i] : arr[n][i] + m[i];
					mx[n][i] = (end >= 0 ? end <= 255 ? end : 255 : 0) - arr[n][i];
				}
				return sp;
			}
		});
		//动画集体、定时器句柄
		var shake = new L.Cache(), animHandle, animLen;

		//添加震荡
		function appendShake(d, fn) {
			shake.append(d, fn);
			if (animHandle == null) {
				animLen = 1;
				animHandle = setInterval(shakeing, 1000 / An.FPS);
			}
			else {
				animLen += 1;
			}
		}

		//删除震荡
		function removeShake(d, flg) {
			if (shake.has(d)) {
				flg && shake.get(d)(flg);
				shake.remove(d);
				animLen -= 1;
			}
			if (animLen < 1) {
				clearInterval(animHandle);
				animHandle = null;
			}
			return this;
		}

		//震荡
		function shakeing() {
			D.forEach(shake.data, function (v, k) {
				shake.data[k]();
			});
		}

		//开始动画
		function playAnim(d) {
			d = $(d);
			//如果这个节点已经在执行 移除
			removeShake(d, 1);
			var an = extra.call({}, arguments[1]),
				arr = {},
				mx = {},
				un = {},
				mt = 0,
				sp = an.speed || 1.2, //速度
				jb = an.callBack || null, //回调
				run = an["run"], //执行的时候回调
				ru = An.rules[an.rule] ? an.rule : An.rule, //动画方式
				hm = an.homing !== false, //程序强制结束 是否要归位 默认需要
				rs = {}; 						//为每个增加动画效果
			delete an.speed;
			delete an.callBack;
			delete an.rule;
			delete an.homing;
			delete an["run"];
			D.forEach(an, function (v, n) {
				n = n.replace(/\-([a-z])/g,
					function () {
						return arguments[1].toUpperCase();
					}).split(/_/);
				var ed = /\$$/.test(n[0]), r = n[1] || "";
				n = n[0].replace(/\$$/, "");
				rs[n] = An.rules[r] ? r : ru;
				mt = Math.max(An.initial[n] ? An.initial[n](d, v, arr, mx, un, sp, ed) : An.initial.natural(d, n, v, arr, mx, un, sp, ed), mt);
			});
			sp < 10 && (sp = Math.max(mt, 400));
			var et = new Date().getTime() + sp,
				of = M.css(d, "overflow");
			M.css(d, "overflow", "hidden");
			//每次滚动的 变换
			function step(fg) {
				fg = fg || 0;
				var p = sp - et + new Date().getTime(),
					flg = fg != 0 || p >= sp, ro = {};
				if (flg) {
					if (fg < 1 || (fg != 0 && hm)) {//程序强制结束 是否要归位 默认需要
						D.forEach(arr, function (v, n) {
							ro[n] = An.execution[n] ? An.execution[n](d, 1, v, mx[n], un[n]) : An.execution.natural(d, n, 1, v, mx[n], un[n]);
						});
					}
					M.css(d, "overflow", of);
					//正常结束 移除
					fg == 0 && removeShake(d);
					fg < 1 && typeof jb == "function" && jb.call(d, ro);
					return;
				}
				//debugger;
				D.forEach(arr, function (v, n) {
					var r = An.rules[rs[n]](p, sp);
					if (An.execution[n]) {
						ro[n] = An.execution[n](d, r, v, mx[n], un[n]);
					}
					else {
						ro[n] = An.execution.natural(d, n, r, v, mx[n], un[n]);
					}
				});
				run && run.call(d, ro);
			}

			appendShake(d, step);
			return this;
		}

		An.play = playAnim;
		An.stop = function (d) {
			if (d) {
				removeShake($(d), -1);
				return An;
			}
			D.forEach(shake.data, function (v, n) {
				shake.data[n](-1);
				shake.remove(n);
				animLen -= 1;
			});
			return An;
		};
	} ();

	//模版
	void function () {
		var tempMReg = /<!--\s*\^(\w+)-->(.*)<!--\1\$\s*-->/g, tempRRe = /\{#([\w\$]*)(?:\|([\w\$]+)(?:\(([\w,]*)\))?)?\}/g;
		U.Template = extend.call(function () {
			this.data = {};
		}, {
			getLocal: function (type) {
				var s = document.getElementsByTagName("script"), n, i = 0;
				if (type == null) {
					type = "text/puitemplate";
				}
				for (; i < s.length; i += 1) {
					if ((n = s[i]).getAttribute("type") == type) {
						this.setModel(n.innerHTML);
						//多次调用 防止重复设置
						n.parentNode.removeChild(n);
					}
				}
				return this;
			},
			setModel: function (str) {
				var v = str.replace(/^\s+|\s+$|\n+|\r+/g, "").replace(/>\s+</g, "><"), arr;
				while (arr = tempMReg.exec(v)) {
					this.data[arr[1]] = arr[2];
				}
				return this;
			},
			apply: function (mId, obj) {
				var me = this;
				if (Object.prototype.toString.call(mId) == "[object Array]") {
					return D.forEach(mId, function (id) {
						return me.apply(id, obj);
					}, []).join("");
				}
				if (me.data[mId]) {
					return me.data[mId].replace(tempRRe, function (str, key, fun, parms) {
						var v = obj && obj[key] !== undefined ? obj[key] : key == "" ? obj : "";
						return fun && t[fun] ? t[fun].apply(me, [v].concat((parms || "").split(/,/))) : v;
					});
				}
				return "";
			}
		});
		var t = U.Template.format = U.Template.prototype.format = {
			//运用其他模板
			apply: function (obj, mId) {
				return this.apply(mId, obj);
			},
			//循环数组 引用其他模板
			applyArray: function (arr, mId, split) {
				return arr ? D.forEach(arr, function (obj) {
					return this.apply(mId, obj);
				}, [], this).join(split || "") : "";
			}
		};
	} ();

	//PUI 核心代码 命名空间.
	window.PUI = I;
	try {
		(window.execScript || window.eval)(jsNode.getAttribute("doexec"));
	} catch (e) { }
} ();

//设置快捷方式
$.forEach = PUI.data.forEach;
$.extra = PUI.data.extend;

$.trace = function(str){
	if(!$.traceDom) {
		$.tarceI = 0;
		$.traceDom = $.dom.create("div", {style:"position:absolute; top:0; right:0; color:#000; background-color:#000; opacity:0.9; filter:alpha(Opacity=90); z-index:999999999;",ondblclick: function() {
			this.innerHTML = "";
			$.dom.getEvent().stopPropagation();
		}}, "", document.body);
		document.ondblclick = function() {
			XN.traceDom.style.display = $.traceDom.style.display == "none" ? "block" : "none";
		}
	}
	var tc = ["#F00","#0F0","#00F","#FF0","#F0F","#0FF"];
	$.traceDom.appendChild($.dom.create("div", {style:"background-color:" + tc[$.tarceI++]}, str));
	$.tarceI = $.tarceI % tc.length;
};

String.prototype.trim = function () {
	return this.replace(/^\s+/, "").replace(/\s\s*$/, "");
};

String.prototype.htmlEncode = function () {
	return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&#34;");
};

String.prototype.uniLength = function () {
	return this.replace(/[^\x00-\xff]/g, "**").length;
};

Date.prototype.format = function (join) {
	return (join || "YYYY-MM-DD").replace(/YYYY/g, this.getFullYear())
		.replace(/YY/g, String(this.getUTCFullYear()).slice(-2))
		.replace(/MM/g, ("0" + (this.getUTCMonth() + 1)).slice(-2))
		.replace(/M/g, this.getUTCMonth()+ 1)
		.replace(/DD/g, ("0" + this.getUTCDate()).slice(-2))
		.replace(/D/g, this.getUTCDate())
		.replace(/hh/g, ("0" + this.getUTCHours()).slice(-2))
		.replace(/h/g, this.getUTCHours())
		.replace(/mm/g, ("0" + this.getUTCMinutes()).slice(-2))
		.replace(/m/g, this.getUTCMinutes())
		.replace(/ss/g, ("0" + this.getUTCSeconds()).slice(-2))
		.replace(/s/g, this.getUTCSeconds());
};

//特殊转换xml为object
$.xjson = function (xml, tag, isone) {
	if (tag) {
		if ($.isChrome || $.isSafari || $.isWebKit) {//chrome
			tag = tag.split(":").pop();
		}
		xml = xml.getElementsByTagName(tag);
		if (isone) {
			xml = xml[0];
		}
		if (xml == null) {
			return {};
		}
	}
	var i, rv;
	if (typeof xml.length == "number") {
		rv = [];
		for (i = 0; i < xml.length; i += 1) {
			rv.push($.xjson(xml[i]));
		}
	}
	else {
		if (xml.documentElement) {
			xml = xml.documentElement;
		}
		if (xml.firstChild.nodeType == 3) {
			rv = xml.firstChild.nodeValue;
		}
		else {
			rv = {};
			var nodes = xml.childNodes, m, v;
			for (i = 0; i < nodes.length; i += 1) {
				if (nodes[i].nodeType == 1) {
					m = nodes[i].nodeName;
					v = nodes[i].firstChild ? nodes[i].firstChild.nodeValue : "";
					if (rv[m] != null) {
						if (rv[m].push) {
							rv[m].push(v);
						}
						else {
							rv[m] = [rv[m], v];
						}
					}
					else {
						rv[m] = v;
					}
				}
			}
		}
	}
	return rv;
};

//格式化大小
$.sizeFormat = function (size, stairs) {
	stairs || (stairs = 1024);
	var x;
	if ((x = size / stairs / stairs / stairs) >= 1) {
		size = Math.floor(x * 10) / 10 + "GB";
	}
	else if ((x = size / stairs / stairs) >= 1) {
		size = Math.floor(x * 10) / 10 + "MB";
	}
	else if ((x = size / stairs) >= 1) {
		size = Math.floor(x * 10) / 10 + "KB";
	}
	else {
		size = size + "B";
	}
	return size;
};

$.loadJS = PUI.lib.loadJS;

//语言文件
var Language = { All: {} };
void function (G) {
	var Lge = {}, LgeSe = new RegExp("[?:; ]*savelge=([^;]*);?").test(document.cookie) ? RegExp["$1"] : "";
	//	G.set = function(k,v){
	//		Lge[k] = v;
	//		if(k==LgeSe){
	//			useLge();
	//		}
	//	};
	function useLge() {
		var s = document.getElementsByTagName("span");
		for (var i = s.length - 1, v; i >= 0; i -= 1) {
			v = s[i].getAttribute("Lge");
			if (v) {
				v = v.split(":");
                var att = v[1] || "innerHTML";
                if(att == 'innerHTML'){
                    s[i][att] = G.get(v[0]);
                }
                else{
                    s[i].setAttribute(att,G.get(v[0]));
                }
			}
		}
	}

	G.use = function (k, fn) {
		LgeSe = k;
		if (Lge[k]) {
			typeof Lge[k] !== true && useLge();
			fn && setTimeout(fn);
		}
		else {
			Lge[k] = true;
			var config = $.config;
			$.loadJS(config.path + ((config["lge_path_" + k] || (config.lge_path + k)) + ".js"), function () {
				Lge[k] = Language.All[k].html;
				$.forEach(Language.All[k].errno, function (v, n) {
					Lge[k][n] = v;
				});
				if (k == LgeSe) {
					useLge();
				}
				fn && fn();
			});
		}
	};
	G.save = function () {
		//保存当前语言到Cookie
		document.cookie = "savelge=" + encodeURIComponent(LgeSe) + "; path=/";
	};
	G.getSe = function () {
		return LgeSe;
	};
	G.get = function (k, flg) {
		var v;
		if (/^\[(img_\w+)\]/.test(k)) {
			var r = RegExp.$1,e = "";
			if(PUI.lib.IE == 6 && /\.png$/.test(k)){
				e = ' onload="$.IE6PNGfixed(this);"';
			}
			v = '<img ' + e + ' src="' + k.replace(/^\[img_\w+\]/, $.config.path + "themes/" + $.config[r]) + '" />';
			//alert(v);
		}
		else {
			v = (Lge[LgeSe] || Lge.us || {})[k] || "";
		}
		return flg ? '<span Lge="' + k + '">' + v + '</span>' : v;
	};
	G.setContent = function (content) {
		if (content.push) {
			return $.forEach(content, function (v) {
				return G.setContent(v);
			}, []).join("&nbsp;");
		}
		if (content.indexOf(":::") == 0) {
			return G.get(content.replace(/^:::/, ""), true);
		}
		if (content.indexOf("::") == 0) {
			return G.get(content.replace(/^::/, ""));
		}
		return content;
	};
} ($.lge = {});

$.tpl = new PUI.ui.Template();
//模板 引用语言
PUI.ui.Template.format.applyLge = function (v, k, no) {
	return v || $.lge.get(k, no == "no" ? null : true);
};
PUI.ui.Template.format.useLge = function (v, no) {
	return $.lge.get(v, no == "no" ? null : true);
};

//移动设备
$.isMobile = /iPhone|iPod|iPad|android/i.test(navigator.userAgent);
$.isIOS = /iPhone|iPod|iPad/i.test(navigator.userAgent);
$.IEVer = PUI.lib.IE;
$.isIE = PUI.lib.IE != 0;
$.isIE6 = PUI.lib.IE == 0;
$.isChrome = PUI.lib.Chrome != 0;
$.isFirefox = PUI.lib.Firefox != 0;
$.isSafari = PUI.lib.Safari != 0;
$.isWebKit = PUI.lib.WebKit;
$.isUC = PUI.lib.isUC;

//消息提示
void function (M) {
	var setContent = $.lge.setContent;
	function setBars(tp) {
		var bars = { $: tp };
		document.body.appendChild(tp);
		$.forEach(tp.getElementsByTagName("*"), function (v) {
			if (v.getAttribute) {
				var b = v.getAttribute("msg_bar");
				if (b) {
					bars["$" + b] = v;
				}
			}
		});
		bars.destroy = function () {
			document.body.removeChild(tp);
		};
		return bars;
	}

		//内容，标题，ok回调函数
	M.alert = function (content, fn1, title) {
		var tp = document.createElement("div");
		tp.className = "NKite";
		tp.innerHTML = [
			'<div class="NKite_C1" id="msg_Mask">',
			'<div class="NKite_C1_header" msg_bar="header">' + setContent(title || "::Prompt_title") + '</div>',
			'<div class="NKite_C1_content" msg_bar="content">' + setContent(content) + '</div>',
			'<a href="javascript:void(0);" hidefocus="true" class="iBtn2" msg_bar="okbtn"><b class="btnc2">' + setContent("::Prompt_OK_value") + '</b></a>',
			'</div>'
		].join("");
		var bars = setBars(tp);
		//单独对消息使用回车事件，防止回车事件冲突
//		$.dom.appendEvent(document,"vkeyenter",function(){
//				$.dom.on(bars.$okbtn,"vclick");
//		});

		$.dom.on(bars.$,"vkeyenter",function(){
			$.dom.getEvent().stopPropagation();
		});
		$.dom.on(bars.$okbtn, "vclick", function (event) {
			var flag;
			if(fn1) {
				flag = fn1.call(bars, event);
			}
			if(flag !== false) {
				bars.destroy();
			}
			return false;
		});
		bars.$okbtn.focus();
	};



	//内容，标题，ok回调函数
	M.confirm = function (content, fn1, fn2, title) {
		var tp = document.createElement("div");
		tp.className = "NKite";
		tp.innerHTML = [
			'<div class="NKite_C1" id="msg_Mask">',
			'<div class="NKite_C1_header" msg_bar="header">' + setContent(title || "::Prompt_title") + '</div>',
			'<div class="NKite_C1_content" msg_bar="content">' + setContent(content) + '</div>',
			'<a href="javascript:void(0);" hidefocus="true" class="iBtn2" msg_bar="okbtn"><b class="btnc2">' + setContent("::Prompt_OK_value") + '</b></a>',
			'<a href="javascript:void(0);" hidefocus="true" class="iBtn2_0" msg_bar="cancelbtn"><b class="btnc2">' + setContent("::Prompt_cancel_value") + '</b></a>',
			'</div>'
		].join("");
		var bars = setBars(tp);
		$.dom.on(bars.$,"vkeyenter",function(){
			$.dom.getEvent().stopPropagation();
		});
		$.dom.on(bars.$okbtn, "vclick", function (event) {
			var flag;
			if (fn1) {
				flag = fn1.call(bars, event);
			}
			if (flag !== false) {
				bars.destroy();
			}
			return false;
		});
		$.dom.on(bars.$cancelbtn, "vclick", function (event) {
			var flag;
			if (fn2) {
				flag = fn2.call(bars, event);
			}
			if (flag !== false) {
				bars.destroy();
			}
			return false;
		});
		bars.$okbtn.focus();
		return bars;
	};

	function tip(content, time, cls){
		var tp = document.createElement("div");
		if (cls) {
			tp.className = "NKite";
			tp.innerHTML = '<div class="' + cls + '">' + content + '</div>';
		}
		else {
			tp.className = "NTip1";
			tp.innerHTML = content;
			//tp.innerHTML = '<strike>' + setContent(content) + '</strike>';
		}
	 var bars = setBars(tp);

	if (time == null) {
			time = 3000;
		}
		if (time > 0) {
			setTimeout(function () {
				bars.destroy();
			}, time);
		}
		return bars;
	}

	//提示框 无蒙板
	M.tip = function (content, time, cls) {
		return tip( '<strike>' + setContent(content) + '</strike>',time,cls);
	};

	//提示框
	M.tip1 = function (content, time) {
		return M.tip(content, time, "NTip1");
	};

	M.tip2 = function(content, time, cls){
		return tip(setContent(content),time,cls);
	};

	//只是一层蒙板
	var iLoad, create = function () {
		iLoad = document.createElement("div");
		iLoad.className = "NLoading";
		iLoad.style.zIndex = "1000";
		iLoad.style.display = "none";
		iLoad.curr = 0;
		iLoad.innerHTML = '<a href="javascript:void(0);"></a>';
		document.body.appendChild(iLoad);
		create = function () { };
	};

    var bodyOv;
	M.openLoad = function () {
		create();
		iLoad.curr += 1;
		if (iLoad.curr == 1){
			iLoad.style.display = "block";
			//iLoad.style.height = $.dom.getMaxHeight() + "px";
			iLoad.style.lineHeight = "50%";
			iLoad.style.width = "100%";
			iLoad.firstChild.focus();
            bodyOv = $.dom.css(document.documentElement,'overflow');
            document.documentElement.style.overflow = 'hidden';
			setTimeout(function(){
				//触发layout，解决IE7 右边空白的问题
				iLoad.style.width = "auto";
			},0);
		}
	};
	M.closeLoad = function () {
		if (iLoad.curr > 0) {
			iLoad.curr -= 1;
			if(iLoad.curr == 0) {
				iLoad.style.display = "none";
                document.documentElement.style.overflow = bodyOv;
			}
		}
	};
} ($.msg = {});

void function () {
	function tipShow(fn) {
		if(this.status == 200 && this.error){
			$.msg.alert(this.error.des, fn);
		}
	}
	function xjson() {
		Array.prototype.unshift.call(arguments, this.responseXML);
		return $.xjson.apply($, arguments);
	}
	$.Ajax = PUI.lib.Ajax;
	$.forEach(["get", "post"], function (type) {
		$.Ajax[type] = function (url, callBack, param, sync) {
			return new $.Ajax(url, type.toUpperCase(), !sync).extend("onCallBack", callBack).send(param);
		};
	});
	//Ajax 设置
	$.Ajax.prototype.onCensor = function () {
		var s = this.status;
		this.showError = tipShow;
		this.xjson = xjson;
		if (this.responseXML && !this.timeout && s >= 200 && s < 300 || s === 304 || s === 1223) {
			var xml = this.responseXML;
			if (xml == null) {
				return true;
			}
			var errno = xml.getElementsByTagName("errno")[0], txt = "0";
			if (errno && errno.firstChild) {
				txt = errno.firstChild.nodeValue || "0";
			}
			if(txt == "20100002" && this.noreload == null) {
				//登出，到登录界面 身份过期
				//$.vhref("../index.html");
				return true;
			}
			return txt == "0" ? true : { code: txt, des: $.lge.get(txt, true) };
		}
		return { code: -1, des: (this.responseXML ? "bad http status" : "bad responseXML") + " [" + this.status + "]"};
	};
} ();

$.dom = PUI.dom;
//IE6 处理png图片，使用滤镜
$.IE6PNGfixed = function(me){
	//var w =  me.clientWidth,h = me.clientHeight;
	//alert(w + "::" + h)
	//if(w && h){
		var css = 'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled="true", sizingMethod="scale", src="' + me.getAttribute("src") + '");';
		me.parentNode.replaceChild($.dom.create("span",{style:css,className:"iPNGIE6"}),me);
	//}
};
$.dom.getMaxHeight = function () {
	//alert(document.documentElement.clientHeight + "::" + document.documentElement.scrollHeight + "::" + document.documentElement.offsetHeight);
	return Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight);
	//return document.documentElement.clientHeight;
};
$.query = $.dom.query;
$.dom.vEvents.vresize = function (fn) {
	//$.isMobile?"orientationchange":"resize"
	var z = $.isMobile?"orientationchange":"resize";
	if (!fn) {
		return z;
	}
	return [z, fn];
};
$.dom.vEvents.vclick = function (fn) {
	var z = $.isMobile ? "mousedown" : "click";
	if (!fn) {
		return z;
	}
	return [z, fn];
};
$.dom.vEvents.vdown = function (fn) {
	var z = $.isMobile ? "touchstart" : "mousedown";
	if (!fn) {
		return z;
	}
	return [z, fn];
};
$.dom.vEvents.vmove = function (fn) {
	var z = $.isMobile ? "touchmove" : "mousemove";
	if (!fn) {
		return z;
	}
	return [z, fn];
};
$.dom.vEvents.vup = function (fn) {
	var z = $.isMobile ? "touchend" : "mouseup";
	if (!fn) {
		return z;
	}
	return [z, fn];
};

$.vsubmit = function (id, fn) {
	var dom = $(id), x = $.dom.on(dom, "vclick", fn);
	return x;
};

$.vhref = function (href) {
	if (href.indexOf("http://") != 0) {
		href = $.config.path + "app/" + href;
	}
	document.location.href = href;
};

void function(M){
	//当前激活
	var iView,iMoveY;
	function getParentHeight(x){
		var h = M.height(x.parentNode),px = (parseInt(M.css(x,"margin-bottom")) || 0)*-1;
//		alert(h + "::" + px + "::" + x.style.marginBottom);
		return h + px;
	}
	function scollStart(){
		iView = this;
		if((this.offsetHeight - getParentHeight(this))<=0 || iMoveY){
			return ;
		}
		var ev = M.getEvent();
		//锁定鼠标
		if(window.captureEvents){
			window.captureEvents(ev.MOUSEMOVE);
		}
		else if(this.setCapture){
			this.setCapture();
		}

		M.appendEvent(document, "vmove",scollMoveing);
		M.appendEvent(document, "vup",scollEnd);
		iMoveY = (ev.clientY * 2) - (parseInt(this.style.marginTop) || 0);
		ev.stopPropagation();
	}

	//鼠标移动中
	function scollMoveing(){
		var ev = M.getEvent();
		ev.preventDefault();
		var max = getParentHeight(iView) - M.height(iView),
			m = Math.ceil((ev.clientY * 2) - iMoveY),
			t = Math.min(0,Math.max(m,max));
		iView.style[iView._t] = t + "px";
		rePlate_t();
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
	}

	//结束移动
	function scollEnd(){
		if(!iMoveY || !iView){
			return ;
		}
		var ev = M.getEvent();
		if(window.releaseEvents){
			window.releaseEvents(ev.MOUSEMOVE);
		}
		else if(iView.releaseCapture){
			iView.releaseCapture();
		}
		M.removeEvent(document, "vup", scollEnd);
		M.removeEvent(document, "vmove", scollMoveing);
		iMoveY = null;
		iView = null;
	}

    function r_start(){
        iView = this;
        if((this.offsetHeight - getParentHeight(this))<=0 || iMoveY){
            return ;
        }
        var ev = M.getEvent();
        //锁定鼠标
        if(window.captureEvents){
            window.captureEvents(ev.MOUSEMOVE);
        }
        else if(this.setCapture){
            this.setCapture();
        }

        M.appendEvent(document, "vmove",r_move);
        M.appendEvent(document, "vup",r_end);
        iMoveY = ev.clientY - (parseInt(this._rs.style.marginTop) || 0);
        ev.stopPropagation();
    }
    function r_move(){
        var ev = M.getEvent();
        ev.preventDefault();
        var rmax = getParentHeight(iView) - iView._rs.offsetHeight - 2;
        var rtop = Math.max(Math.min(ev.clientY -  iMoveY,rmax),0);
        iView._rs.style.marginTop = rtop + 'px';

        var max = getParentHeight(iView) - M.height(iView);
        iView.style[iView._t] = Math.ceil(max*(rtop/rmax)) + 'px';

        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
    }
    function r_end(){
        if(!iMoveY || !iView){
            return ;
        }
        var ev = M.getEvent();
        if(window.releaseEvents){
            window.releaseEvents(ev.MOUSEMOVE);
        }
        else if(iView.releaseCapture){
            iView.releaseCapture();
        }
        M.removeEvent(document, "vup", r_end);
        M.removeEvent(document, "vmove", r_move);
        iMoveY = null;
        iView = null;
    }

	function rePlate_t(x){
		x || (x = iView);
		var rs = x._rs;
		if(!rs || rs.style.display == "none"){
			return ;
		}
		var h = getParentHeight(x),dh = M.height(x), rh = (h / dh)*h;
		rs.style.marginTop = (dh > h?Math.floor(Math.abs(parseInt(x.style.marginTop) || 0)/(dh - h) * (h - rh)):0) + "px";
	}

	function rePlate(dom,isSet){
		var x = dom,rs = x._rs;
		if(!rs){
			return ;
		}
		var h = getParentHeight(x),dh = x.offsetHeight, rh = (h / dh)* h;
		if(dh == 0){
			return ;
		}
		//alert(dh  + "::" + h);
		if(dh > h){
			var mt = parseInt(x.style.marginTop) || 0;
			if(mt < h - dh){
				x.style.marginTop = h - dh + "px";
			}
			rs.style.display = "block";
			rs.style.marginTop = Math.floor(Math.abs(parseInt(x.style.marginTop) || 0)/(dh - h) * (h - rh)) + "px";
			rs.style.height = Math.floor(rh) + "px";
		}
		else{
			if(isSet !== true){
				x.style.marginTop = "0px";
			}
			rs.style.marginTop = "0px";
			rs.style.display = "none";
		}
	}

	function dcWheel(){
		var rs = this._rs,ev = M.getEvent();
		if(rs.style.display != "none"){
			var flg = ev.wheelDeltaFlg,
				max = getParentHeight(this) - this.offsetHeight,
				m = (parseInt(this.style.marginTop) || 0) + (this.getAttribute("wheel") || 40)*(flg?-1:1),
				t = Math.min(0,Math.max(m,max));
			this.style.marginTop = t + "px";
			rePlate_t(this);
		}
		ev.preventDefault();
		ev.stopPropagation();
	}

	M.setScroll = function(dom,rs,isTop){
		dom._rs = rs;
		dom._t = isTop?"top":"marginTop";
		M.on(dom, "vdown", scollStart);
        M.on(rs, "vdown", function(ev){
            r_start.call(dom,ev);
        });
		M[$.isIE?"on":"appendEvent"](dom, "mousewheel",dcWheel);
		rePlate(dom,true);
	};
	$.reScrollPlate = function(dom,isTop){
		rePlate(dom,isTop);
	}
}($.dom);


//select控件
void function (M) {
	function empty(){}
	//蒙板只有一层
	var iMask, createMask = function(){
		iMask = M.create("div", { className: "NMOpt"+ ($.isUC?" iAbsolute":"")  }, "", document.body);
		M.appendEvent(iMask, "vdown", function () {
			M.getEvent().preventDefault();
			close();
		});
		createMask = empty;
	};
	var iView;
	function close() {
		if (iView) {
			iMask.style.display = iView.style.display = "none";
		}
		iView = null;
		//document.documentElement.style.overFlow = "auto";
		return false;
	}

	M.setSelect2 = function(data, def, cls){
		var opt = {};
		var copt, crs, cct, clines = {}, cl, make = function () {
			//
			//<div class="NCOpt_rs"></div><div class="NCOpt_c"></div>
			opt.copt = copt = M.create("div", { className: "NCOpt" + (cls ? " " + cls : "") }, '', document.body);
			M.appendEvent(copt, "vmove", function () {
				M.getEvent().preventDefault();
			});
			crs = M.create("div",{className:"NCOpt_rs"});
			copt.appendChild(crs);
			var x = cct = M.create("div",{className:"NCOpt_c"});
			copt.appendChild(x);
			$.forEach(data, function (vv, k) {
				x.appendChild(clines[k] = M.create("span", { className: "line", value: k }, vv));
				M.on(clines[k], "vclick", elect);
			});
			if (def && clines[def]) {
				clines[def].className = "linese";
				cl = def;
			}
			opt.vcreate && opt.vcreate();
			//M.appendEvent(x, "vclick", elect);
			//M.on(x, "vdown", scollStart);
			make = empty;
		};

		function change(y, cFlag) {
			if(y != null && y != cl) {
				cl && (clines[cl].className = "line");
				clines[y].className = "linese";
				var flag = y != opt.v;
				opt.v = cl = y;
				opt.value = M.text(clines[y]);
				if (cFlag !== false && flag && opt.vchange) {
					opt.vchange();
				}
			}
		}

		function elect() {
			change(this.getAttribute("value"));
			setTimeout(close, 100);
			return false;
		}

		var setScroll = function(){
			M.setScroll(cct,crs);
			setScroll = empty;
		};

		function show(x,y) {
			createMask();
			iMask.style.display = "block";
			iMask.style.height = $.dom.getMaxHeight() + "px";
			copt.style.display = "block";
			if(y != null){
				copt.style.top = y + "px";
			}
			if(x != null){
				copt.style.left = x + "px";
			}
			//opt.setOffset(copt);
			//document.documentElement.style.overFlow = "hidden";
			iView = copt;
			var v = opt.v;
			//alert(clines[v] + "::" + (cl != v));
			if (clines[v] && (cl == null || cl != v)) {
				change(v, false);
			}

			if(cl){
				var max = M.height(copt) - M.height(cct) + (parseInt(M.css(cct,"margin-bottom")) || 0)*-1;
				if(max<0){
					cct.style.marginTop = Math.max(max,(parseInt(cct.style.marginTop) || 0) - clines[v].offsetTop) + "px";
				}
			}
			opt.blur && opt.blur();
			setScroll();
		}

		if(data[def]){
			opt.value = data[def].replace(/<.*?>/g, "");
			opt.v = def;
			opt.vchange && opt.vchange();
		}

		opt.show = show;

		opt.clines = clines;
		make();
		copt.style.display = "none";
		return opt;
	};

	//设置dom
	M.setSelect = function (dom, data, def, cls) {
		var opt = M.setSelect2(data, def, cls);

		function show(){
			opt.show();
			var copt = opt.copt;
			var xy = M.offset(dom),mtop = document.documentElement.scrollTop || document.body.scrollTop,mleft = Math.max(8,document.documentElement.scrollLeft || document.body.scrollLeft);
			copt.style.top = Math.max(mtop,xy.top - copt.offsetHeight) + "px";
			//copt.style.left = Math.max(mleft,(xy.left + xy.width/2) - copt.offsetWidth/2) + "px";
			var cw = window.innerWidth || document.documentElement.offsetWidth;
			if(cw > 500){
				copt.style.left = Math.max(mleft,(xy.left + xy.width/2) - copt.offsetWidth/2) + "px";
			}
			else{
				copt.style.left = Math.max(mleft,(cw - copt.offsetWidth)/2) + "px";
			}
		};
//		opt.setOffset = function(copt){

//		};
		opt.vcreate = function(){
			dom.vcreate && dom.vcreate();
		};
		opt.vchange = function(){
			dom.v = opt.v;
			dom.value = opt.value;
			dom.vchange && dom.vchange();
		};
		opt.blur = function(){
			dom.blur();
		};

		M.on(dom, "vclick", function(){
			if(dom.getAttribute("vselectshow") == "false"){
				return false;
			}
			if(dom.canShow !== false){
				//var ev = M.getEvent(),x = ev.clientX,y = ev.clientY;
				setTimeout(function(){
					show();
				});
			}
			$.dom.getEvent().stopPropagation();
			return false;
		});
		if(dom.parentNode.parentNode.className.indexOf("iIpt") == 0){
				M.on(dom.parentNode.parentNode, "vclick", function(){
				M.on(dom,"vclick");
				return false;
			});
		}
		//M.on(dom,"focus",show);
//		alert(data[def]);
		if(data[def]){
			dom.value = opt.value;
			dom.v = opt.v;
			opt.vchange();
		}

		return opt.clines;
	};

	//目录选择
	var iDirlist,iRoot,iElectDir;
	function electPropfind(path,con,callremove){
		new $.Ajax(encodeURI(path).replace(/#/g,"%23").replace(/\%25([0-9a-z]{2})/g,"%$1"), "PROPFIND", true).extend("onCallBack", function(){
			if(this.responseXML == null || this.status < 200 || this.status >= 300) {
				this.showError();
				return ;
			}
			var types = $.xjson(this.responseXML, "D:getcontenttype");
            con.innerHTML = $.forEach($.xjson(this.responseXML, "D:href"), function(href, i){
                href = href.replace(/^http:\/\/[^\/]*/, "").replace(/\/+$/, "");
                var xs = href.split(/\//);
                if(i == 0){
                    xs.pop();
                    href = xs.join("/");
                    if(!/^\//.test(href)){
                        href = "/" + href;
                    }
                }
                var name = i?unescape(decodeURIComponent(xs.pop())):" ...";

                if(types[i] == "httpd/unix-directory" && name.indexOf(".") != 0){
                    var pRoot = ["/","/"],pAarray = href.split("/");
                    for (var i = 0; i < pAarray.length; i++) {
                        if (i < 4) {
                            pRoot[0] = (pRoot[0] == "/" ? "" : pRoot[0] + "/")  + (pAarray[i] || "");
                        } else {
                            pRoot[1] = (pRoot[1] == "/" ? "/" : pRoot[1] + "/")  + (pAarray[i]);
                        }
                    }
                    //console.log(pRoot[0] + "\n" + pRoot[1] + "\n"+ pAarray);
                    var root = name.trim() == "..." ? 'x-path="' + href + '"':"";
                    var v = (iDirlist[pRoot[0]] || "") + pRoot[1];
                    if(callremove && callremove(decodeURIComponent(v))){
                        return '';
                    }
                    return [
                        '<div class="iElectDir_li">',
                            '<div class="iElectDir_li_point" x-path="' + href + '"></div>',
                            '<div class="iElectDir_li_txt" '+ root +' v="'+ v + '"'  + (i?' s':' x') + '-path="' + href + '">' + name.htmlEncode() + '</div>',
                        '</div>'
                    ].join("");
                }
                return "";
            }, []).join("");
			iElectDir = null;
			con.style.marginTop = "0px";
			$.reScrollPlate(con);
		}).extend("onCensor", function(){return true;}).send(null, {
			"Content-Type": "text/xml; charset=\"utf-8\"",
			Depth: 1
		}, true);
	}
	function electDirlist(con,callremove){
		var htmls = [],v;
		for(var path in iDirlist){
            if(!(callremove && callremove(iDirlist[path]))){
                htmls.push([
                    '<div class="iElectDir_li">',
                        '<div class="iElectDir_li_point" x-path="' + path + '" x-root="' + path + '"></div>',
                        '<div class="iElectDir_li_txt" v="'+ iDirlist[path] +'" s-path="' + path + '" x-root="' + path + '">' + iDirlist[path].htmlEncode() + '</div>',
                    '</div>'
                ].join(""));
            }
		}
		con.innerHTML = htmls.join("");
		iElectDir = null;
		con.style.marginTop = "0px";
		$.reScrollPlate(con);
	}
	M.electDir = function(dom,callback,callremove){
		var copt,crs,cct,ccot;
		var make = function () {
			copt = M.create("div", { className: "NCOpt iElectDir"}, '<div class="iElectDir_header"><span class="iElectDir_btn">' + $.lge.get("Prompt_OK_value") + '</span><span class="iElectDir_title">' + $.lge.get("Service_DLNA_Dir_Elect") + '</span></div><div class="iElectDir_con"><div class="NCOpt_rs"></div><div class="NCOpt_c"></div></div>', document.body);
			ccot = copt.firstChild.nextSibling;
			crs = ccot.firstChild;
			cct = crs.nextSibling;
			
			M.on(cct,"vclick",function(){
				var target = M.getEvent().target,root = target.getAttribute("x-root"),xpath = target.getAttribute("x-path");
				if(root){
					iRoot = root;
				}
				if(xpath){
					if(iRoot != xpath && iRoot.indexOf(xpath) == 0){
						electDirlist(cct,callremove);
					}
					else{
						electPropfind(xpath,cct,callremove);
					}
					return false;
				}
				var spath = target.getAttribute("s-path");
				if(spath){
					if(iElectDir){
						iElectDir.parentNode.className = "iElectDir_li";
					}
					iElectDir = target;
					iElectDir.parentNode.className = "iElectDir_li iElectDir_liview";
				}
				return false;
			});
			M.on(copt.firstChild.firstChild,"vclick",function(){
				if(iElectDir){
                    var value = unescape(decodeURI(iElectDir.getAttribute("v")));
                    var v = unescape(decodeURI(iElectDir.getAttribute("s-path")));
                    if(callback){
                        callback(v,value);
                    }
                    else{
                        dom.value = value;
                        dom.v = v;
                    }
					setTimeout(close, 100);
				}
				return false;
			});
			make = empty;
		};
		var setScroll = function(){
			M.setScroll(cct,crs);
			setScroll = empty;
		};
		function show(){
			createMask();
			make();
			iMask.style.display = "block";
			iMask.style.height = $.dom.getMaxHeight() + "px";
			copt.style.display = "block";
			copt.style.position = "absolute";
			var xy = M.offset($(dom.getAttribute('for_pos') || dom));
			copt.style.top = Math.max(10,xy.top - 200) + "px";
            copt.style.left = Math.max(10,(xy.left + xy.width/2) - copt.offsetWidth/2) + "px";

			iView = copt;

			setScroll();
		}

		M.on($(dom.getAttribute("forDir") || dom), "vclick", function(){
			if(dom.getAttribute("vselectshow") == "false"){
				return false;
			}
			if(dom.canShow !== false){
				if(cct){
					cct.innerHTML = "";
				}
				iDirlist = {};
				$.msg.openLoad();
				$.Ajax.get("/protocol.csp?fname=security&opt=dirlist&user=" + $.data.account + "&function=get",function(){
					$.msg.closeLoad();
					if(!this.error){
						show();
						$.forEach($.xjson(this.responseXML,"item"),function(l){
							if(l.limit.indexOf("w")>-1){
								iDirlist[l.path] = l.name;
							}
						});
						electDirlist(cct);
					}
					else{
						this.showError();
					}
				});
			}
			return false;
		});
	};
}($.dom);

//向导
$.wizard = {
	next: function(restart, href){
		setTimeout(function(){
			if(restart){
				//保存当前语言到Cookie
				document.cookie = "wizardRe=1;path=/";
			}
			document.location.href = href || $("wizard_skip").getAttribute("href");
		},0);
	},
	finish: function(){
		document.cookie = "wizardRe=0;path=/";
		$.systemMain();
	},
	getRe: function(){
		return new RegExp("[?:; ]*wizardRe=([^;]*);?").test(document.cookie) ? RegExp["$1"] : "0";
	},
	clear:function(){
		document.cookie = "wizardRe=0;path=/";
	}
};

//热插拔设备检测 SD USB oMain
void function(H){
	var iStorage,isIndex = /app\/index\.js$/.test($.config.script);
	if(!$.config.hasHDD){
	// H.getStorage = function(){
	//	 getStorage(true);
	 //};
	 getStorage();
		//setInterval(getStorage,5*1000);
	}
	function getStorage(backFlag){
		if(!$.config.hasHDD && $.config.verify != 'none' && !isIndex){
			$.Ajax.get("/protocol.csp?fname=storage&opt=listen_disk&function=get",function(){
			var v = $.xjson(this.responseXML,"listen_disk",true);
			if(this.error || v.errno != "0"){
				return;
			}else{
				var storage = {
					_text:this.responseText
				},csd = 0,cusb = 0;
				var items = $.xjson(this.responseXML,"item");	
				storage._items = items;
				for(var i = 0,n;i<items.length;i+=1){
					n = (items[i].type).toLowerCase().replace(/\s/g,"");
					storage[n] = items[i];
				}

				if(iStorage && iStorage._text != storage._text){
					var isd = iStorage.sdcard,sd = storage.sdcard;
					if(isd && sd){
						//两次请求数据都存在，比较两项属性，有差异，说明换卡了
						if(isd.name != sd.name || isd.type != sd.type ){
							csd = 2;
							$.msg.alert("::HotPlug_SDCard_in");
						}
					}
					else if(isd){
						csd = -1;
						$.msg.alert("::HotPlug_SDCard_out");
					}
					else if(sd){
						csd = 1;
						$.msg.alert("::HotPlug_SDCard_in");
					}
					iStorage.usbdisk1 == null ? iStorage.usbdisk1 = "" :iStorage.usbdisk1 = iStorage.usbdisk1;
					iStorage.usbdisk2 == null ? iStorage.usbdisk2= "" :iStorage.usbdisk2  = iStorage.usbdisk2;
					iStorage.usbdisk3 == null ? iStorage.usbdisk3 = "" :iStorage.usbdisk3 = iStorage.usbdisk3;
					
					storage.usbdisk1 == null ? storage.usbdisk1 = "" :storage.usbdisk1 = storage.usbdisk1;
					storage.usbdisk2 == null ? storage.usbdisk2= "" :storage.usbdisk2  = storage.usbdisk2;
					storage.usbdisk3 == null ? storage.usbdisk3 = "" :storage.usbdisk3 = storage.usbdisk3;
					
					var iusbmemory =[ iStorage.usbdisk1.name == null ? "":iStorage.usbdisk1.name=iStorage.usbdisk1.name,
												   iStorage.usbdisk2.name == null ? "":iStorage.usbdisk2.name=iStorage.usbdisk2.name,
												   iStorage.usbdisk3.name == null ? "":iStorage.usbdisk3.name=iStorage.usbdisk3.name
												  ];	//上次的插拔信息
										
					var usbmemory =[ storage.usbdisk1.name == null ? "":storage.usbdisk1.name =storage.usbdisk1.name ,
												   storage.usbdisk2.name == null ? "":storage.usbdisk2.name =storage.usbdisk2.name ,
												   storage.usbdisk3.name == null ? "":storage.usbdisk3.name =storage.usbdisk3.name 
												  ];	// 这次的插拔信息
					
					
						// iStorage.usbdisk1 || iStorage.usbdisk2 ,usbmemory = storage.usbdisk1 || storage.usbdisk2;
						
					if(iusbmemory[0] == "" &&  usbmemory[0] ||
						 iusbmemory[1] == "" &&  usbmemory[1] ||
						 iusbmemory[2] == "" &&  usbmemory[2]
					){
						//两次请求数据都存在，比较两项属性，有差异，说明换卡了
							cusb = 2;
							$.msg.alert("::HotPlug_USBDevice_in");
						}	
					else if(iusbmemory[0] && usbmemory[0] == "" || 
							    iusbmemory[1] && usbmemory[1] == "" ||
							    iusbmemory[2] && usbmemory[2] == "" 
						){
						cusb = -1;
						$.msg.alert("::HotPlug_USBDevice_out");
					}
					else{
					}
				}
				iStorage = storage;
				if(backFlag || csd || cusb){
					H.storageChange && H.storageChange(iStorage,csd,cusb);
				}
			}			
			
		});	
	}
		setTimeout(function(){getStorage(true);},5*1000);	
		}
	

}($.hotPlug = {});
//获取
//document.ontouchmove = function(){
//	if(document.activeElement && document.activeElement.tagName.toLowerCase() == "input"){
//		alert($.dom.getEvent().target == document.activeElement);
//		if($.dom.getEvent().target == document.activeElement){
//			$.dom.getEvent().preventDefault();
//		}
//	}
//};
//document.ontouchstart = function(){
//	if(document.activeElement && document.activeElement.tagName.toLowerCase() == "input"){
//		if($.dom.getEvent().target != document.activeElement){
//		document.activeElement.blur();
//	}
//}
//};
$.dom.appendEvent(document,"touchmove",function(){
	var x = document.activeElement;
	x && x.blur();
});

//执行
document.title = $.config.title;
if($.config.lgeTitle){
	var setI = setInterval(function(){
		var title = $.lge.get("Title");
		if(title){
			document.title = title;
			clearInterval(setI);
		}	
	},100);
}
//数据存储
$.data = {};
void function () {

	//固件自动更新
	function getUpdata(){
		$.Ajax.get("/protocol.csp?fname=system&opt=auto_update&function=get",function(){
			//this.error = null;
			//this.responseXML = PUI.data.parseXML('<root><system><auto_update><local_version>2.000.252</local_version><new_version>3.1111</new_version><client><win>11fefe</win><ios>22fea</ios><android>3feafe</android><mac>4feafea</mac></client><buglist><bug>1.123feafffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff</bug><bug>2.124feaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</bug><bug>3.125fffffffffffffffffffffffffffffffaefaefefaefefaef</bug><bug>4.126</bug><bug>5.12fefa</bug><bug>5.12fefa</bug></buglist><errno>0</errno></auto_update></system></root>');
			if(this.error == null){
				var local = $.xjson(this.responseXML,"local_version",true),newr = $.xjson(this.responseXML,"new_version",true);
				if(parseInt("1" + (local.replace(/\./g,"") + "0000000000").slice(0,10)) < parseInt("1" + (newr.replace(/\./g,"") + "0000000000").slice(0,10))){
					$.msg.confirm($.lge.get("System_Firmware_Version") + ":" + local + "<br />" + $.lge.get("System_Firmware_Version_new") + ":" + newr + "<br />" + $.lge.get("System_Firmware_isUpdata"),function(){
						//更新
						$.Ajax.post("/protocol.csp?fname=system&opt=auto_update&action=1&function=set",function(){
							//fx = 1;
							if(this.error == null){
								$.systemRe("System_Firmware_UpInfo",301,true);
							}
							else{
								this.showError();
							}
						});
					});
				}
			}
		});
	}
	var saveLge, pagejs = $.config.script,docEl = document.documentElement,isIndex = /app\/index\.js$/.test(pagejs);

	//定时更新 防止身份过期
	function getStatus() {
		$.Ajax.get("/protocol.csp?fname=net&opt=waninfo&function=get&r=" + Math.random(), function () {
			setTimeout(getStatus, 60000);
		});
	}

	function loadjs() {
		function setM() {
			var z = $("Main_System_Re");
			//			alert(z.innerHTML*1-1);
			var v = (parseInt(z.innerHTML) || 0) - 1;
			z.innerHTML = v;
			if (v > 0) {
				setTimeout(setM, 1000);
			}
			else {
				document.location.reload();
			}
		}

		$.systemRe = function (k, time, href) {
			var str = $.lge.get(k).replace(/\{#n\}/i, '<span id="Main_System_Re">' + ((time || 120) + 1) + '</span>').replace(/\{#time\}/i, time);
			if (href) {
				$.msg.tip1(str, time * 1000);
				setM();
			}
			else {
				$.msg.openLoad();
				$.Ajax.get("/protocol.csp?fname=system&opt=guide&action=2&function=set",function(){
					if(this.error==null){
						$.Ajax.get("/protocol.csp?fname=system&opt=setting&action=reboot&function=set&r=" + Math.random(), function () {
						if (this.error == null) {
							$.msg.tip1(str, time * 1000);
							setM();
					    }
					    else {
						    this.showError();
					    }
				  	       $.msg.closeLoad();
				        });
					}
				});
			
			}
		};

		$.systemOut = function (){
			$.msg.confirm("::Login_Is_Out", function () {
				$.msg.openLoad();
				$.Ajax.post("/index.csp?fname=logout", function () {
					$.msg.openLoad();
					document.cookie = "hasfirmcheck=0;path=/";
					document.cookie = "SESSID=";
					$.vhref("../index.html");
				});
			});
		};

		//检测固件升级
		if(!isIndex && /hasfirmcheck=1/.test(document.cookie) && $.data.account == "admin"){	
			setTimeout(function(){
				getUpdata();
			},2000);
			document.cookie = "hasfirmcheck=0;path=/";
		}
		//电源电量信息===========================================使用事件模式======================
		var power = $.power = new PUI.lib.Event();
		var msgSing = new RegExp("[?:; ]*msgSing=([^;]*);?").test(document.cookie + "")?decodeURIComponent(RegExp["$1"]):"";
		power.data = {
			low_power_flag:1,
			adapter_flag:1,
			power:1
		};
		power.get = function(){
			power.clear();
			power.fireEvent("getStart");
			//$("mm_Power").style.display = "none";
			$.Ajax.get("/protocol.csp?fname=system&opt=i2c&function=get",function(){
				if(!this.error){
					//设置电量图标
					var x = $.xjson(this.responseXML,"i2c",true);
					var c = x.charge;
					var powIcon = $("mm_Power");
					var b = power.battery = x.battery;
					if(powIcon){
					   powIcon.className = b>75?"MMetro_bottom_Power":b>50?"MMetro_bottom_Power1":b>25?"MMetro_bottom_Power2":"MMetro_bottom_Power3";
					}
					var i = power.data;
					if(i.adapter_flag == 1){
						i.adapter_flag = 0;
						i.power = c;
					}
					if(c != i.power){			
					//暂时不添加对电源适配器插拔的提示信息
						if(c == 1 && i.power == 0){
						//	$.msg.alert("::System_PowerApapter_in");
						}
						if(c == 0 && i.power == 1){
						//	$.msg.alert("::System_PowerApapter_out");
						}
					}
					i.power = c;
					if(x.charge == 1){
						document.cookie = "msgD=0";
						if(powIcon){
								power.chargeInterval = setInterval(function(){
									var pc = powIcon.className;
									powIcon.className = 
									pc == "MMetro_bottom_Power" ? "MMetro_bottom_Power1":
									pc == "MMetro_bottom_Power1" ? "MMetro_bottom_Power2":
									pc == "MMetro_bottom_Power2" ? "MMetro_bottom_Power3":"MMetro_bottom_Power";
								},500);
							}
					}

					if(x.lowV == 1 && msgSing != 1){
						document.cookie = "msgSing=" + 1;
						if(powIcon){
						    powIcon.className = "MMetro_bottom_Power2";
						}
						//即将关机
						$.msg.alert("::System_Power_Down");
					}

					if( b < 20 && i.low_power_flag == 1 && msgSing != 2){
						document.cookie = "msgSing=" + 2;
						if(powIcon){
						    powIcon.className = "MMetro_bottom_Power2";
						}
					
						//电量过低
						i.low_power_flag = 0;
						$.msg.alert("::System_Power_Low");
					}

					if(x.tempeB == 1 && msgSing != 3){
						document.cookie = "msgSing=" + 3;
						//设备温度过高，请你降温。
						$.msg.alert("::System_Power_Temp_Height");
					}

					power.fireEvent("getSuccess");

					power._itv = setTimeout(function(){
						power.get();
					},1000*20);
				}
			});
		};
		power.clear = function(){
			clearTimeout(power._itv);
			clearInterval(power.chargeInterval);//清除充电状态
		};

		//isIndex 为 true 说明是在登录页面上了
		function pageEnd(){
			//电量获取
			if($.config.hasPower && !isIndex){
				power.get();
			}
		}

		if(pagejs){
			$.loadJS(pagejs,function(){
				//页面上基本所有的保存按钮的id都是submit
				//增加回车提交时间
				var submit = $("submit");
				if(submit){
					$.dom.appendEvent(document,"vkeyenter",function(){
						$.dom.on(submit,"vclick");
					});
				}
				pageEnd();
			});
		}
		else{
			pageEnd();
		}
	}

	function allReady() {
		//模版
		$.tpl.getLocal("text/template");
		//加载语言文件
		if (("," + $.config.language.join(",") + ",").indexOf("," + saveLge + ",") < 0) {
			saveLge = $.config.language[0];
		}
		$.lge.use(saveLge, loadjs);
		//保存当前语言文件
		$.lge.save();
	}

	//ipadon
	var iPadDom, isPadUI, iMaxLen = 690;
	$.systemMain = function(){
		$.vhref($.data.account == "guest"?docEl.clientWidth >= iMaxLen ? "explorer/explorer.html" : "set.html":"main.html");
	};
	$.systemSetMain = function(){
		$.vhref(isPadUI ? "information/main.html" : "set.html");
	};
	var iPadResizeItv;
	function systemPadResize(){
		clearTimeout(iPadResizeItv);
		iPadResizeItv = setTimeout(function(){
			if(iPadDom && isPadUI){
				//$("pad_ui_icons").style.height = docEl.clientHeight - 45 + "px";
				var s = $("pad_ui_icons_view");
				if(s){
					$.reScrollPlate(s);
				}
				//iPadDom.style.height = "auto";
				//iPadDom.style.height = $.dom.getMaxHeight() + "px";
				//iPadDom.style.height = Math.max(590,$.dom.getMaxHeight()) + "px";
			}
		},200);
	}
	$.systemPadResize = function(){};
	function padUIResize(ev) {
		isPadUI = ((ev && $.isMobile)?docEl.clientHeight:docEl.clientWidth) >= iMaxLen;
		if(iPadDom){
			if(isPadUI){
				$.dom.addClass(docEl, "PadUI");
				systemPadResize();
				//iPadDom.style.height = Math.max(590,$.dom.getMaxHeight()) + "px";
			}
			else{
				$.dom.removeClass(docEl, "PadUI");
			}
		}
	}
	function padUIInit() {
		var path = document.location.pathname.replace(/\/app\/(\w+)\/.+$/,"$1"),d = $("pad_ui_con");
		if(d){
			iPadDom = d;
			try{
					$("pad_ui_title").innerHTML = ($.config.homeTitle||$.config.title);
				
			}catch(e){};
			return ;
		}
		var user_enter = ($.data.account == "guest") ? "guest" : "main";
		iPadDom = $.dom.create("div", { className: "MPadList" }, [
			'<div class="MHeader">',
			'<div class="MHeader_r">',
			'<a href="javascript:void($.systemOut());" class="MHeader_btn1"></a>',
			'</div>',
			//'<b class="MHeader_txt0">' + $.config.homeTitle==null?$.config.title:$.config.homeTitle + '</b>',
			'<b class="MHeader_txt0">' + ($.config.homeTitle||$.config.title) + '</b>',
			'</div>',
			'<div class="MPadIcons" id="pad_ui_icons">',
			'<div class="NCOpt_rs" id="pad_ui_icons_rs"></div>',
			'<div class="MPadIconsView" id="pad_ui_icons_view">',
			'<div class="ico" id="pad_ui_explorer" vhref="explorer/explorer.html" style=" display:none;">',
			$.lge.get("[img_main]explporer.png"),
			'<span Lge="Explorer"></span>',
			'</div>',
			'<div class="ico" id="pad_ui_information" vhref="information/main.html">',
			$.lge.get("[img_main]information.png"),
			'<span Lge="Downloads"></span>',
			'</div>',
			'<div class="ico" id="pad_ui_user" vhref="user/'+user_enter+'.html">',
			$.lge.get("[img_main]user.png"),
			'<span Lge="Setting_Nav_User"></span>',
			'</div>',
			'<div class="ico" id="pad_ui_network" vhref="network/main.html">',
			$.lge.get("[img_main]network.png"),
			'<span Lge="Setting_Nav_Network"></span>',
			'</div>',
			'<div class="ico" id="pad_ui_services" vhref="services/main.html">',
			$.lge.get("[img_main]service.png"),
			'<span Lge="Setting_Nav_Services"></span>',
			'</div>',
			'<div class="ico" id="pad_ui_system" vhref="system/main.html">',
			$.lge.get("[img_main]system.png"),
			'<span Lge="Setting_Nav_System"></span>',
			'</div>',
			'<div class="ico" id="pad_ui_wizard" vhref="wizard/start.html">',
			$.lge.get("[img_main]wizard.png"),
			'<span Lge="Setting_Nav_Wizard"></span>',
			'</div>',
			'</div>',
			'</div>'
		].join(""), document.body);
		var x = $.query("#pad_ui_[explorer,information,user,network,services,system,wizard]").on("vclick", function (){
			//保存当前语言到Cookie
			document.cookie = "padlistrstop=" + $("pad_ui_icons_view").style.marginTop + ";path=/";
			$.vhref(this.getAttribute("vhref"));
			return false;
		});
		if($.data.account == "guest"){
			x.css("display","none").$.explorer.style.display = x.$.user.style.display = "block";
		}
		x.$[path] && $.dom.addClass(x.$[path], "view");
		$("pad_ui_icons_view").style.marginTop = new RegExp("[?:; ]*padlistrstop=([^;]*);?").test(document.cookie) ? RegExp["$1"] : "0";
		$.dom.setScroll($("pad_ui_icons_view"),$("pad_ui_icons_rs"));
	}

	function loadLge(){
		saveLge = $.lge.getSe();
		if(saveLge){
			allReady();
		}
		else{
			//后台去当前语言环境
			$.Ajax.get("/protocol.csp?fname=system&opt=web_session_lang&function=get", function () {
				saveLge = this.error ? "zh_CN" : $.xjson(this.responseXML, "lang", true).split("/").pop();
				allReady();
			});
		}
	}

	if($.config.verify == 'none'){
		loadLge();
	}
	else{
		//验证登录
		$.Ajax.post("/protocol.csp?fname=security&opt=curtype&function=get", function () {
			//this.error = null;
			if(this.error){
				$.config.hasHDD = true;
			}
			if(this.error && !isIndex) {
				//打开登录界面
				$.vhref("../index.html");
				return;
			}
			$.data.account = $.xjson(this.responseXML,"curtype",true).name || "guest";
			//$.data.account = "guest";
			if(this.error == null && isIndex){
				//登录OK
				//$.vhref("main.html");
				$.systemMain();
				return;
			}

			if(docEl.clientWidth >= iMaxLen || docEl.clientHeight >= iMaxLen){
				if(docEl.getAttribute("ui_type") != "noPadUI"){
					padUIInit();
				}
				$.dom.appendEvent(window,$.isMobile?"orientationchange":"resize",padUIResize);
				//window.onresize = padUIResize;
				padUIResize();
			}

			!isIndex && getStatus();

			loadLge();
		}).noreload = true;
	}
}();