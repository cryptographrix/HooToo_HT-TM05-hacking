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
	4: "11b/g/n",
	1: "802.11b",
	2: "802.11g",
	3: "802.11n"
};
$.dom.setSelect($("mode"), iModes);
var iChannels = {};
$.forEach([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],function(v){
	iChannels[v] = v || "auto";
});
//通道
var iChannelLine = $.dom.setSelect($("channel"),iChannels, null, "MNetworkWifiOpt");

//安全
var iSecuritys = {
	0: "None",
	//	1:"OPENWEP",
	2: "WPA-PSK",
	3: "WPA2-PSK",
	4: "Mixed WPA/WPA2-PSK"
};
$.dom.setSelect($("security"), iSecuritys, null);
$("security").vchange = function () {
	$("passwd").style.visibility = $("security").v == "0" ? "hidden" : "visible";
};

//地区 通道集
var iReqions = {
	US:["United States",0,1,2,3,4,5,6,7,8,9,10,11],
	GB:["England",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	CN:["China",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	JP:["Japan",0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
	DE:["Germany",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	KP:["South Korea",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	RU:["Russia",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	KR:["North Korea",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	FR:["France",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	PT:["Portugal",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	ES:["Spain",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	NL:["Netherlands",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	IT:["Italy",0,1,2,3,4,5,6,7,8,9,10,11,12,13],
	IL:["Israel",0,3,4,5,6,7,8,9]
};

void function(){
	var reqion = {};
	for(var n in iReqions){
		reqion[n] = $.lge.get("Region_" + n);
	}
	$.dom.setSelect($("region"), reqion, null);
	$("channel").vcreate = $("region").vchange = function(){
		var ri = $("region").v;
		for(var i=0;i<15;i+=1){
			iChannelLine[i] && (iChannelLine[i].style.display = "none");
		}
		var rg = iReqions[ri];
		for(i=1;i<rg.length;i+=1){
			iChannelLine[rg[i]] && (iChannelLine[rg[i]].style.display = "block");
		}

		var c = $("channel"),cv = iChannelLine[c.v];
		if(cv && cv.style.display == "none"){
			c.value = "auto";
			c.v = "0";
		}
	};
}();

$.dom.on($("ssidview"),"vclick",function(){
	this.className = this.className == "iSwitch_1"?"iSwitch_1-0":"iSwitch_1";
});

function successNext(activeneed){
	if(isWizard) {
		$.wizard.next(true);
		return ;
	}
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

var iWiFi = {}, iLan = {}, iRegion = {};
function saveWiFi(pm, fun) {
	//for(var n in pm){
	//	pm[n] = encodeURIComponent(pm[n]);
	//}
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_ap&encode=1&function=set" + wizardStr, function () {
		if (this.error == null) {
			iWiFi = pm;
		}
		else {
			this.showError();
		}
		fun && fun("WiFi");
	}, pm);
}

function saveLan(pm, fun) {
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_lan_ip&function=set" + wizardStr, function () {
		if (this.error == null) {
			iLan = pm;
		}
		else {
			this.showError();
		}
		fun && fun("Lan");
	}, pm);
}

function saveRegion(pm,fun){
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_channel_region&function=set" + wizardStr,function(){
		if(this.error){
			this.showError();
		}
		else{
			iRegion = pm;
		}
		fun && fun("Region");
	},pm);
}

function getWiFi() {
	if (saveWiFi.flag) {
		return;
	}
	var pw = {
		mode: $("mode").v ,
		channel: $("channel").v,
		security: $("security").v,
		hide_ssid:$("ssidview").className == "iSwitch_1"?1:0
	};
	var ssid = $("SSID");
	pw.SSID = ssid.value.trim();
	//[a-zA-Z]
	//if (!/^[\x20-\x7E]{2,32}$/.test(pw.SSID)) {
	//	$.msg.alert("::Setting_Network_WiFiLANerror1",function(){
//			setTimeout("$('SSID').focus()",200);
//			});
//		return;
//	}
	if(pw.SSID.length >32 || pw.SSID.length< 2){
		$.msg.alert("::Setting_Network_WiFiLANerror1",function(){
			setTimeout("$('SSID').focus()",200);
			
	    });
	   return;
	}

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
	}else if(pw.security == 0){
		pw.passwd = "";
	}
	
	return pw;
}

function getLan() {
	if (saveLan.flag) {
		return;
	}
	var pl = {};
	var ip = $("ip");
	pl.ip = ip.value.trim();
	if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(pl.ip)) {
		var msg;
		if(pl.ip == ""){
			msg = "::Setting_DDNS_NotEmpty";
		}else{
		    msg = "::Setting_Network_DHCPServer_error";
		}
		$.msg.alert(["::Setting_Network_WiFiLANIP",msg],function(){ setTimeout("$('ip').focus()",200);});
		return;
	}

	var mask = $("mask");
	pl.mask = mask.value.trim();
	if (!/(?:^(?:254|252|248|240|224|192|128|0)\.0\.0\.0$)|(?:^255\.(?:254|252|248|240|224|192|128|0)\.0\.0$)|(?:^255\.255\.(?:254|252|248|240|224|192|128|0)\.0$)|(?:^255\.255\.255\.(?:254|252|248|240|224|192|128|0)$)/.test(pl.mask)) {
		var msg;
		if(pl.mask == ""){
			msg = "::Setting_DDNS_NotEmpty";
		}else{
		    msg = "::Setting_Network_DHCPServer_error";
		}
		$.msg.alert(["::Setting_Network_WiFiLANMask", msg],function(){setTimeout("$('mask').focus()",200);});
		return;
	}
	return pl;
}

function getRegion(){
	if(saveRegion.flag){
		return ;
	}
	var pr = {},code = $("region").v;
	if(iReqions[code]){
		pr.country = iReqions[code][0];
		return pr;
	}
	return ;
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
				activeneed += "&active=wifi_ap";
				//saveWiFi(pw,back);
				break;
			}
		}
		for(n in pm.Lan){
			//alert(iLan[n] + "::" + pl[n]);
			if(iLan[n]!=pm.Lan[n]){
				backneed.Lan = 1;
				activeneed += "&active=wifi_lan_ip";
				//saveLan(pl,back);
				break;
			}
		}
		for(n in pm.Region){
			if(iRegion[n]!=pm.Region[n]){
				backneed.Region = 1;
				if(activeneed.indexOf("&active=wifi_ap")<0){
					activeneed += "&active=wifi_ap";
				}
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
	if((pm.WiFi = getWiFi()) && (pm.Lan = getLan()) && (pm.Region = getRegion())){
		if (  $("ip").value.trim() != iLan.ip ){
			$.msg.alert("::Setting_Network_WiFiLANIP_Change_Tips",function(){
				submit(pm);
			});
		}else
		{
			submit(pm);
		}
	}

	
});

function securitySelect() {
	$("passwd").style.visibility = $("security").v == "0" ? "hidden" : "visible";
}

//wifi获取
$.Ajax.get("/protocol.csp?fname=net&opt=wifi_ap&encode=1&function=get" + wizardStr, function () {
	//测试
	if (this.error) {
		return;
	}
	iWiFi = $.xjson(this.responseXML, "wifi_ap", true);
	$("SSID").value = decodeURIComponent(iWiFi.SSID);
	var m = $("mode");
	m.v = iWiFi.mode;
	m.value = iModes[iWiFi.mode];

	var chl = $("channel");
	chl.v = iWiFi.channel;
	chl.value = iChannels[iWiFi.channel];

	var sey = $("security");
	sey.v = iWiFi.security;
	sey.value = iSecuritys[iWiFi.security];

	$("passwd").value = decodeURIComponent(iWiFi.passwd);

	iWiFi.hide_ssid = iWiFi.HIDE_SSID;
	$("ssidview").className = iWiFi.hide_ssid == 1?"iSwitch_1":"iSwitch_1-0";
	securitySelect();
});

//获取Lan
$.Ajax.get("/protocol.csp?fname=net&opt=wifi_lan_ip&function=get" + wizardStr, function () {
	if (this.error) {
		return;
	}
	iLan = $.xjson(this.responseXML, "wifi_lan_ip", true);

	$("mac").value = iLan.mac;
	$("ip").value = iLan.ip;
	$("mask").value = iLan.mask;
});

//获取地区
$.Ajax.get("/protocol.csp?fname=net&opt=wifi_channel_region&function=get" + wizardStr,function(){
	if(this.error){
		iRegion = {};
	}
	else{
		iRegion = $.xjson(this.responseXML,"wifi_channel_region",true);
		iRegion.country = iRegion.Country;
		if(iRegion.CountryCode){
			var region = $("region");
			region.v = iRegion.CountryCode;
			region.value = $.lge.get("Region_" + iRegion.CountryCode);
			$("region",function(){
				this.v = iRegion.CountryCode;
				try{
					this.value = $$("reqion_" + iRegion.CountryCode).innerHTML;
				}catch(e){}
			});
			$("region").vchange();
		}
	}
});