$("Metro_settings").onclick = function(){
	$.systemSetMain();
	return false;
};
if($.config.showFirmware){
		//设备系统版本号
		$.Ajax.get("/protocol.csp?fname=system&opt=devinfo&function=get",function(){
			if(this.error == null){
				$("mm_ShowFirmware").innerHTML = "FW Ver."+$.xjson(this.responseXML,"version",true);
				$("mm_ShowFirmware").style.display = "block";
			}
		});
}	

//HDD SD 显示
void function(){
	var mSD = $("mm_SD"),mHDD = $("mm_HDD");
	if($.config.hasHDD && $.config.hasPlug){
		mHDD.style.display = "block";
	}
	if($.config.hasSD && $.config.hasPlug){
		//$.hotPlug.getStorage();
		mSD.style.display = "block";
	}
	$.hotPlug.storageChange = function(storage){
		mHDD.className = storage.usbdisk1 || storage.usbdisk2 ? "MMetro_bottom_DISK":"MMetro_bottom_DISK-0";
		mSD.className = storage.sdcard ? "MMetro_bottom_SD":"MMetro_bottom_SD-0";
	};
}();

//InterNet 状态
var netIcon = $("mm_Net");
var netS;
(function getInterNet(){
	$.Ajax.get("/protocol.csp?fname=net&opt=led_status&function=get",function(){
	var x = $.xjson(this.responseXML,"led_status",true);
	//使用全局配置，无需5秒请求一次dom
	if(netS != x.internet){
		netIcon.className = x.internet==0?"MMetro_bottom_Internet_ON":"MMetro_bottom_Internet_OFF";
		netIcon.style.display = "block"
	}
	netS = x.internet;
	});
	setTimeout(function(){getInterNet();},5000);
})();

$.power.appendEvent("getStart",function(){
	if($.config.hasPower){
	$("mm_Power").style.display = "";
	}else{
	$("mm_Power").style.display = "none";
	}
	
});
$.power.appendEvent("getSuccess",function(){
	//var c = $("mm_Power"),b = this.battery;
	//$("mm_Power").className = b>80?"MMetro_bottom_Power":b>25?"MMetro_bottom_Power1":"MMetro_bottom_Power2";
	//c.style.display = "block";
});