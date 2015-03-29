//获得主机名称
$.Ajax.get("/protocol.csp?fname=system&opt=host&function=get",function(){
	if(this.error == null){
		$("Device_HostName").innerHTML = $.xjson(this.responseXML,"host",true).name;
	}
});
if($.config.theme == "public_wifidisk"){
	$("Device_Vendor").parentElement.style.display = "none";
}
//设备系统版本号
$.Ajax.get("/protocol.csp?fname=system&opt=devinfo&function=get",function(){
	if(this.error == null){
		var v = $.xjson(this.responseXML,"devinfo",true);
		$("Device_Vendor").innerHTML = v.vendor;
		$("Device_Serial").innerHTML = v.sn;
		$("Device_Model").innerHTML = v.name;
	}
});

function getCPU(){
	//获取CUP 使用量
	$.Ajax.get("/protocol.csp?fname=system&opt=cpu&function=get",function(){
		if(this.error == null){
			$("Device_CPU").innerHTML = $.xjson(this.responseXML,"cpu",true).used;
		}
		setTimeout(getCPU,15000);
	});
}
getCPU();
