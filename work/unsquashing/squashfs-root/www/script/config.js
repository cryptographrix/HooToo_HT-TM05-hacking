//本地核心文件
//简单的Dom ID筛选
function $(s){
	return typeof s == "string" ? document.getElementById(s) : s;
}

//配置文件
void function(theme){
	var C = $.config = {
		path:"/",
	  //img_css:"default/css/",
		img_main:"default/main/",
		img_img:"default/img/",
		img_metro:"default/metro/",
		img_storage:"default/storage/",
		img_metro_b:"default/metro/",
		lge_path:"script/lge/",
		//单独设置某个 lge的 位置 例如 如下：
//		lge_path_us:'themes/' + theme + "/us",
		title:"My Disk",
		hasHDD:true,   //是否HDD板子
		hasSD:false,   //是否SD板子
		hasPlug:false, //是否支持插拔信息
		hasPower:false,//是否显示主页电量图标
		hasRJ45:true,  //有线网络默认有
		hasPPPoE:true, //PPPoE
		hasExt:false,  //外网服务
	    hasThunder:false, //迅雷远程下载
		has5G:false,      //5G模式
		has3G:false,      //3G网卡
		hasDlnaPlay:true,//dlna播放推送
		hasWPS:false,//WPS连接
		hasHideSSID:false,//获取隐藏SSID
		hasChromecast:false,//Chromecast功能
		hasNetworkON_OFF:false,//是否有Internet开关
		hasInlayDisk:true,//是否内嵌硬盘(用于验证是否移除)
		hasDLNA:true,//是否有dlna服务
		dlnaMultipleDir:false,//DLNA服务多目录
		hasCheckPwd : false,//修改密码时是否验证旧密码
		languageName:{
			"us":"English",
			"zh_CN":"简体中文",
			"tr_CN":"繁体中文",
			"ja_JP":"日本語",
			"de_DE":"Deutsch",//德语
			"ko_KO":"한국의", //韩语
			"ru_RU":"русский", //俄语
			"fr_FR":"Français", //法语
			"pu_PU":"Portuguese",//葡萄牙
			"du_DU":"Nederlands",//荷兰
			"sp_SP":"Español", //西班牙
			"it_IT":"Italiano", //意大利
			"ar_AR":"Arabic",//阿拉伯
			"po_PO":"Polish"//波兰
		},
		//支持的语言 英语 简体中文 繁体中文 日文 德文
		language:["us","zh_CN","tr_CN"]
	}
	//扩展配置可以对C扩展
	//所需要加载的脚本
	// = document.location.pathname.split("/m2/")[0] + "/m2/"
	void function(){
		var path = C.path,heads = [];
		var n = document.getElementsByTagName("script");
		n = n[n.length - 1];
		var js = n.getAttribute("js");
		if(js == null){
			C.script = document.location.pathname.replace(path + "app/",path).replace(path,path + "script/app/").replace(/\.[^\.]*$/,"").replace(/\/$/,"/index") + '.js';
		}
		else if(js == "none"){
			C.script = "";
		}
		else if(js.indexOf("./") == 0){
			C.script = $.config.path + "script/app/" + js.replace(/^\.\//,"");
		}
		else{
			C.script = js;
		}
		C.verify = n.getAttribute('verify');
		//C.heads
		heads[0] = n.getAttribute("vcss") == "no" ? "" : '<link rel="stylesheet" href="' + C.path + 'themes/' + theme + '/main.css" />';
		heads[1] = '<script type="text/javascript" src="' + C.path + 'themes/' + theme + '/config.js"></script>';
		heads[2] = '<script type="text/javascript" src="' + C.path + 'script/core.js"></script>';
		C.heads = heads;
	}();

	C.allLges = function(){
		var h = [],n;
		for(n in C.languageName){
			if(C.languageName.hasOwnProperty(n)){
				h.push(n);
			}
		}
		return h;
	}();

	
	C.theme = theme;

	document.write(C.heads.join(""));

	$.setConfig = function(fn){
		fn.call(C);
	};
}("HT-TM05");