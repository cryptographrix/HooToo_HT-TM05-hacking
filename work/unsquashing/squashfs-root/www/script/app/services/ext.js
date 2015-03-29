//语言设置
var Enable = false;
$.Ajax.get("/protocol.csp?fname=system&opt=rpcserver&function=get",function(){
	if(this.error == null){
		Enable = $.xjson(this.responseXML,"rpcserver",true).enable==1;
		$("Service_Ext").style.display=Enable?"block":"none";
		$("enable").className = Enable?"iSwitch_1":"iSwitch_1-0";
	}
});

$.vsubmit("enable",function(){
this.className = this.className == "iSwitch_1"?"iSwitch_1-0":"iSwitch_1";
if(this.className == "iSwitch_1"){
		$("Service_Ext").style.display = "block";
	}else{
		$("Service_Ext").style.display = "none";
		
		}
return false;
}); 
$.vsubmit("submit",function(){
	var eb = $("enable").className == "iSwitch_1";
	if(eb==Enable){
		return ;
	}
	
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=system&opt=rpcserver&function=set",function(){
		$.msg.closeLoad();
		if(this.error == null){
			Enable = eb;
		}
	},{
		action:eb?1:0
	});
});

	//设备系统版本号
		$.Ajax.get("/protocol.csp?fname=system&opt=devinfo&function=get",function(){
			if(this.error == null){
				var deviceInfo = $.xjson(this.responseXML,"devinfo",true);
				//iVersion =$.xjson(this.responseXML,"devinfo",true).version;
				//mac =$.xjson(this.responseXML,"devinfo",true).mac0; 
				//iVendor =$.xjson(this.responseXML,"devinfo",true).vendor;
				//iSN =$.xjson(this.responseXML,"devinfo",true).sn; 
				//iMode =$.xjson(this.responseXML,"devinfo",true).name; 
				var link = "http://" + deviceInfo.vendor + deviceInfo.sn + ".miniyun.com:9000/";
				$("Service_Ext_Link").innerHTML = '<a href="'+link+'" class="ExtLink" target="_blank" hidefocus="true">'+link+'</a>';
			}
		});
//var link = "http://" + top.Entry.getVendor() + top.Entry.getSN() + ".miniyun.com:9000/";

//$("Service_Ext_Link").innerHTML = '<a href="'+link+'" class="ExtLink" target="_blank" hidefocus="true">'+link+'</a>';