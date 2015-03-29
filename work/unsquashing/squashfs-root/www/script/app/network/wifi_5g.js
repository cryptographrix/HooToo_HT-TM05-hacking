/**
 * Created with JetBrains PhpStorm.
 * User: poppy
 * Date: 12-12-18
 * Time: 下午3:40
 * To change this template use File | Settings | File Templates.
 */
var isWizard = document.location.pathname.indexOf("/app/wizard/")>=0;
var wizardStr = isWizard?"&delay=1":"";
//模式选择
var iModes = {
	//1: "11a only",
	2: "11a/n mixed mode",
	3: "11vht AC/AN/A",
	4: "11vht AC/AN",
};
$.dom.setSelect($("mode"), iModes);
var iChannels = {},channelArray = [0,149,153,157,161,165];
if($.config.tempChannel){	
	//[0,36,40,44,48,52,56,60,64,100,104,108,112,116,132,136,140,149,153,157,161,165]
	channelArray = [0,36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140];
}
$.forEach(channelArray,function(v){
		if(v == 0){
			iChannels[v] = "auto";
		}else{
			iChannels[v] = v ;
		}
		
	});
//通道
var iChannelLine = $.dom.setSelect($("channel"),iChannels, null, "MNetworkWifiOpt");

//安全
var iSecuritys = {
	0: "None",
	//1: "OPENWEP",
	2: "WPA-PSK",
	3: "WPA2-PSK",
	4: "Mixed WPA/WPA2-PSK"
};
$.dom.setSelect($("security"), iSecuritys,null);
$("security").vchange = function () {
	$("passwd").style.visibility = $("security").v == "0" ? "hidden" : "visible";
};

//地区 通道集
var iReqions = {
	//US:["United States",0,36,40,44,48,52,56,60,64,100,104,112,116,120,124,128,132,136,140,149,153,157,161,165],
	US:["United States",0,149,153,157,161,165],
	GB:["England",0,149,153,157,161,165],
	CN:["China",0,149,153,157,161,165],
	JP:["Japan",0,149,153,157,161,165],
	DE:["Germany",0,149,153,157,161,165],
	KP:["South Korea",0,149,153,157,161,165],
	RU:["Russia",0,149,153,157,161,165],
	KR:["North Korea",0,149,153,157,161,165],
	FR:["France",0,149,153,157,161,165],
	PT:["Portugal",0,149,153,157,161,165],
	ES:["Spain",0,149,153,157,161,165],
	NL:["Netherlands",0,149,153,157,161,165],
	IT:["Italy",0,149,153,157,161,165],
	IL:["Israel",0,149,153,157,161,165],
};

$.dom.on($("ssidview"),"vclick",function(){
	this.className = this.className == "iSwitch_1"?"iSwitch_1-0":"iSwitch_1";
});

function successNext(activeneed){
	if(activeneed != null){
		if(activeneed){
			$.Ajax.post("/protocol.csp?fname=net&opt=wifi_active&function=set" + activeneed, function () {
				if(this.error){
					this.showError();
				}
				$.msg.closeLoad();
			});
		}
		else{
			$.msg.closeLoad();
		}
	}
}

var iWiFi = {};//, iLan = {}, iRegion = {};
function saveWiFi(pm, fun) {
		//for(var n in pm){
		//	pm[n]  = encodeURIComponent(pm);
		//}
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_5g&encode=1&function=set" + wizardStr, function () {
		if (this.error == null) {
			iWiFi = pm;
		}
		else {
			this.showError();
		}
		fun && fun("WiFi");
	}, pm);
}
function getWiFi() {
	if (saveWiFi.flag) {
		return;
	}
	var pw = {
		phymode: $("mode").v ,
		channel: $("channel").v || "0",
		security: $("security").v || "0",
		hide_ssid:$("ssidview").className == "iSwitch_1"?1:0
	};
	var ssid = $("SSID");
	pw.SSID = ssid.value.trim();
	var passwd = $("passwd");
	pw.passwd = passwd.value;
	if (pw.security == 1) {
		if (pw.passwd.length != 5 && pw.passwd.length != 13) {
			$.msg.alert("::Setting_Network_WiFiLANerror2",function(){
				 setTimeout("$('passwd').focus()",200);
				});
			return;
		}
	} else if (pw.security != 0) {
		if (!/^[\x00-\xFF]{8,63}$/.test(pw.passwd)) {
			$.msg.alert("::Setting_Network_WiFiLANerror3",function(){
				 setTimeout("$('passwd').focus()",200);
				});
			return;
		}
	}
	return pw;
}

function submit(pm){
	var backneed = {},activeneed = "";
		function back(x){
			if(backneed[x] == null){
				return false;
			}
			delete backneed[x];
			for(var k in backneed){
				return false;
			}
			successNext(activeneed);
		}

		var n;
		for(n in pm.WiFi){
			if(iWiFi[n]!=pm.WiFi[n]){
				backneed.WiFi = 1;
				activeneed += "&active=wifi_ap_5g";
				//saveWiFi(pw,back);
				break;
			}
		}
		if(activeneed){
			$.msg.openLoad();
			for(n in backneed){
				window["save" + n](pm[n],back);
			}
		}
		else{
			successNext();
		}
	
	return false;
}



$.vsubmit("submit",function () {
	var pm = {};
	if(pm.WiFi = getWiFi()){
			submit(pm);
	}
});

function securitySelect() {
	$("passwd").style.visibility = $("security").v == "0" ? "hidden" : "visible";
}

//wifi获取
$.Ajax.get("/protocol.csp?fname=net&opt=wifi_5g&function=get&encode=1" + wizardStr, function () {
	//测试
	if (this.error) {
		return;
	}
	iWiFi = $.xjson(this.responseXML, "wifi_5g", true);
	$("SSID").value = decodeURIComponent(iWiFi.SSID);
	var m = $("mode");
	m.v = iWiFi.mode;
	m.value = iModes[iWiFi.mode];

	var chl = $("channel");
	chl.v = iWiFi.channel || "0";
	chl.value = iChannels[iWiFi.channel] || "auto";

	var sey = $("security");
	sey.v = iWiFi.security ? iWiFi.security == "1" ? "0" : iWiFi.security : "0";
	sey.value = iSecuritys[iWiFi.security] || iSecuritys[0];

	$("passwd").value = iWiFi.passwd;

	iWiFi.hide_ssid = iWiFi.HIDE_SSID;
	$("ssidview").className = iWiFi.hide_ssid == 1?"iSwitch_1":"iSwitch_1-0";
	securitySelect();
});
