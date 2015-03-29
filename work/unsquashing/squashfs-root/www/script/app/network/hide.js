/**
 * User: Psz
 * Date: 14-04-23
 */
var isWizard = document.location.pathname.indexOf("/app/wizard/")>=0;
var wizardStr = isWizard?"&delay=1":"";

//安全 - //对应iEncryption参数
var iSecuritys = {
	1: [0,3], //OPEN
	5: [3], //Share
	3: [2,1,4],//WPA2-个人
	2: [1,2,4],//WPA-个人
	4: [2,1,4]//混合
	//5:[]
};
//加密
var iEncryption = {
	0:"NONE",
	3:"WEP",
	2:"TKIP",
	1:"AES",
	4:"TKIPAES"
	};
//设置选择
var encry,secury;
void function(){
	var security = {},encryption = iEncryption,encryDom = $("encryption");;
	//----------初始化页面
	for(var n in secury){
		secury[n].style.display = "none";
	}
	
	//创建Security集合
	for(var n in iSecuritys){
		security[n] = $.lge.get("Setting_Network_Hide_Security_" + n);
	}
	secury = $.dom.setSelect($("security"), security, null);
	$("security").value = $.lge.get("Setting_Network_Hide_Security_" + 1);
	encryDom.value = "NONE";
	var pass = $("passwd");
	pass.className = "iIpt3_0";
	pass.disabled = true;
	pass.value = "";
	//------------------------------
	//创建Encryption集合
	encry = $.dom.setSelect(encryDom, iEncryption, null);
	for(var n in encry){
		encry[n].style.display = "none";
	}	
	encry[0].style.display = "block";
	encry[3].style.display = "block";
	$("security").vchange = function () {
	var v = this.v;
	 pass = $("passwd");
	//不需要密码的,禁用密码框
	if(v == "1" || v == "5"){
		$("pwd").className = "iIpt3_0";
		pass.disabled = true;
		pass.value = "";
	}else{
		$("pwd").className = "iIpt3";
		pass.disabled   = false;
	}
	//Security 中的 Encryption type集合
	var isecurity = "," + iSecuritys[v].join(",") + ",";
	for(var n in encry){//setSelect返回dom集合
    if(isecurity.indexOf("," + n + ",") > -1){
      encry[n].style.display = "block";
    }
    else{
      encry[n].style.display = "none";
    }
	}
	//console.log("-----------------------------------分割");
	encryDom.value = encryption[isecurity[1]];
	//一个的话，就不弹出来
	if(isecurity.length < 4){
		$("iencry").className = "iIpt3_0";
		encryDom.className = "";
		encryDom.disabled = true;
	}else{
		$("iencry").className = "iIpt3";
		encryDom.className = "ipt_v";
		encryDom.disabled = false;
	}
}
getHiddenInfo();
}();
//获取信息
function getHiddenInfo(){
	$.msg.openLoad();
	$.Ajax.get("/protocol.csp?fname=net&opt=wifi_linkssid&encode=1&function=get" + wizardStr,function(){
	$.msg.closeLoad();	
		if(!this.error){
			var hideap  = $.xjson(this.responseXML,"linkssid",true);
			$("SSID").value = decodeURIComponent(hideap.SSID) || "";
			$("passwd").value = hideap.passwd || "";
			$("security").value = $.lge.get("Setting_Network_Hide_Security_" + hideap.security || "");
			$("encryption").value = iEncryption[hideap.encryptype || 0];
			$("security").v = hideap.security || "";
			$("encryption").v = hideap.encryptype || 0;
			var pass = $("passwd");
			if(hideap.security == "1" || hideap.security == "5"){		
				$("pwd").className = "iIpt3_0";
				pass.disabled = true;
				pass.value = "";
			}else{
				$("pwd").className = "iIpt3";
				pass.disabled = false;
			}
			//迭代出iEncryption子集
			var encryption = iSecuritys[hideap.security];
			for(var n in encry){
				encry[n].style.display = "none";
			}
			for(var i = 0;i<encryption.length;i++){
				encry[encryption[i]].style.display = "block";
			}
			
		}		
	});
};

//设置信息
function setHiddenInfo(pm){
	$.msg.openLoad();
	//编码
	//for(var n in pm){
	//	pm[n] = encodeURIComponent(pm[n]);
	//}
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_linkssid&encode=1&function=set" + wizardStr,function(){
	$.msg.closeLoad();
	if(!this.error){
			var hideap  = $.xjson(this.responseXML,"linkssid",true);
			if(isWizard){
				$.vhref("wizard/wifi.html");
				return ;
			}
			if(hideap["default"] == "1"){
				$.msg.alert("::Setting_DDNS_Success");
			}
			
				getHiddenInfo();		
		}
	},pm);
}

//保存
$.vsubmit("submit", function () {
	var pm = {};
	pm.SSID = $("SSID").value.trim();
	 if (!pm.SSID) {
		var Msg = $.lge.get("Setting_Network_WiFiLANSSID") + " " + $.lge.get("Setting_DDNS_NotEmpty");
		$.msg.alert(Msg,function(){
			setTimeout("$('SSID').focus()",200);
		}); 
		return ;
	 }
	var s = $("security"),e = $("encryption");
	if(s.v == null || s.v == ""){
		pm.security = 1;
	}else{
		pm.security = s.v;
	}
	
	if(e.v == null || e.v == ""){
		pm.encryptype = 0;
	}else{
		pm.encryptype = e.v;
	}
	pm.passwd = $("passwd").value.trim();
	if (!/^[\x00-\xFF]{8,63}$/.test(pm.passwd) && pm.security != 1 && pm.security != 5) {
		$.msg.alert("::Setting_Network_WiFiLANerror3",function(){
			setTimeout("$('passwd').focus()",200);
		});
		return;
	} 
	pm.dhcp = 1;
	setHiddenInfo(pm);
	return false;
});