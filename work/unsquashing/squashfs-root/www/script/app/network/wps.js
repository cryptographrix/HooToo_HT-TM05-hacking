/**
 * User: Psz
 * Date: 14-4-1
 */

//主要开关
function empty(){};
var iS0 = $.query("#[S0_1,S0_2]").on("vclick", function () {
	if (iS0.viewed) {
		iS0.viewed.className = "iRadio_2";
		$(iS0.viewed.id + "c").style.display = "none";
	}
	iS0.viewed = this;
	$("Error").style.display = "none";
	if(this.id == "S0_2"){
		$("confirm_0").style.display = "block";
		$("cancel_0").style.display = "none";
	}else{
		$("confirm_0").style.display = "none";
		$("cancel_0").style.display = "block";
		$("S0_1m").style.display = "block";
		$("S0_2m").style.display = "none";
	}
	this.className = "iRadio_2 iRadio_elect";
	$(this.id + "c").style.display = "block";
	$.systemPadResize();
	clearInterval(temp);
	iS0["get" + this.id]();
	return false;
}).$;
//enable按钮
$.dom.on($("enable"),"vclick",function(){
		if(this.className == "iSwitch_1-0"){
			//开启
			toChangeClass(true);
			setWpsEnable(1);
		}else{
			//关闭
			toChangeClass(false);
			setWpsEnable(0);
		}
	});
function setWpsEnable(s){
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_24_wps_enable&wifi_24_wps_en="+ s +"&function=set",function(){
		$.msg.closeLoad();
	});
}
//切换样式
function toChangeClass(s){
	var en = $("enable");
	if(s){
		en.className = "iSwitch_1";
		$("wpssetting").style.display = "block";
	}else{
		en.className = "iSwitch_1-0";
		clearInterval(temp);
		$("wpssetting").style.display = "none";	
		$("S0_2c").style.display = "none";
	}
}
iS0.getS0_1 = function () {
	setWpsMode();
	Timers();
};

iS0.getS0_2 = function () {
	getWapPin();
};
//重新获取
$.dom.on($("retry"),"vclick",function(){
	$("Error").style.display = "none";
	$("wps_msg_2").style.dispaly = "none";
	$("S0_2m").style.display = "none";
	Timers();
});

//取消
$.query("#[cancel_0,cancel_1]").on("vclick", function(){
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_24_wps_link_cancel&function=set",function(){
	$.msg.closeLoad();
	clearInterval(temp);
		iS0.viewed.className = "iRadio_2";
		$(iS0.viewed.id + "c").style.display = "none";
		//iS0.viewed = "";
		if(this.id != "cancel_1"){
			$("cancel_0").style.display = "none";
			$("S0_1c").style.display = "none";
		}	
	$("Error").style.display = "none";
	});
});

$.dom.on($("confirm_0"),"vclick",function(){
	var p = $("pin").value.trim();
	if(p != "" && p.length == 8 && !isNaN(p)){
		setWpsMode(p);
	}else{
		$.msg.alert("::Setting_Network_WPS_Msg_2");
		return false;
	}
});
//计时器
var temp;
function Timers(){
	//计时器,时间,每秒进度
	var time = 2*60*1000,w = (time / 1000 / 100),width = 0;
	$("Progress_time").style.width = 0;
	$("S0_1m").style.display = "block";
	if(iS0.viewed.id == "S0_1"){
			$("wps_msg_1").innerHTML  = $.lge.get("Setting_Network_WPS_Msg_1");
			}else if(iS0.viewed.id == "S0_2"){
			$("wps_msg_1").innerHTML  = $.lge.get("Setting_Network_WPS_SetPin");
		}
	clearInterval(temp);//进入之前清除，防止冲突
	temp = setInterval(function(){
		//获取连接状态
		getWpsInfo();
		width =  Math.min(100,width += w); 
		$("Progress_time").style.width = width + "%";
		//console.log(width);
		if(width == 100){
			clearInterval(temp);//关闭计时器
			//发送取消,并且提示失败
			$("cancel_0").style.display = "none";
			$("Error").style.display = "block";
			$("S0_1m").style.display = "none";
			$("S0_2m").style.display = "block";
		} 
	},2000);
}
//获取之后再显示
//$.dom.on($("S0_1"),"vclick");
//获取wps开关状态
var getWpsEnable = function(){
	$.Ajax.get("/protocol.csp?fname=net&opt=wifi_24_wps_enable&function=get",function(){
		if(!this.error){
			var wps = $.xjson(this.responseXML,"wifi_24_wps_en",true);
			toChangeClass(wps == 1 ? true : false);
		}
	});
	 return arguments.callee;
}();

//设置wps开启关闭
function setWpsEnable(flag){
	var wps_en = flag == true ? 1 : 0;
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_24_wps_enable&wifi_24_wps_en=" + wps_en +"&function=set",function(){
		if(!this.error){
			getWpsEnable();
		}
		$.msg.closeLoad();
	});
}
//
$.dom.on($("wps_rescan"),"vclick",function(){
	getWapPin(true);
});
//获取WAP PIN
function getWapPin(p){
	$.msg.openLoad();
	var r = 0;//不更新
	if(p != null){
		r = 1; //更新
	}
	$.Ajax.get("/protocol.csp?fname=net&opt=wifi_24_wps_pincode_renew&wifi24_wps_pincode_renew="+ r +"&function=get",function(){
		if(!this.error){
			$("wap_pin").value = $.xjson(this.responseXML,"wifi24_wps_pincode",true);
		}
			$.msg.closeLoad();
	});
}
//获取连接模式
function getWpsMode(){
	$.msg.openLoad();
	$.Ajax.get("/protocol.csp?fname=net&opt=wifi_24_wps_mode&function=get",function(){
	$.msg.closeLoad();
	    if(!this.error){
		var  mode = $.xjson(this.responseXML,"wifi_24_wps_mode",true);
		}
	});
}
//设置连接模式
function setWpsMode(pin){
	$.msg.openLoad();
	var s = 2,v = "",p = pin == null ? "" : pin.trim();
	if(p != ""){
		v = "&wifi24_wps_pincode=" + p;
		s = 1;
	}
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_24_wps_mode&wifi24_wps_mode="+ s + v +"&function=set",function(){
	$.msg.closeLoad();
	    if(!this.error){
			$("S0_2c").style.display = "none";
			$("S0_1c").style.display = "block";		
			$("confirm_0").style.display = "none";
			$("cancel_0").style.display = "block";
			Timers();
		}else{
			this.showError();
		}
	});
}
//连接状态
function getWpsInfo(){
	$.Ajax.get("/protocol.csp?fname=net&opt=wifi_24_wps_link_status&function=get",function(){
		if(!this.error){
			var s = parseInt($.xjson(this.responseXML,"wifi24_wps_link_status",true));
			//1=闲置、3=开始连接、4~33=正在连接、34=连接成功、其他=失败
			if(s == 34){
				clearInterval(temp);//关闭计时器
				$("S0_1c").style.display = "none";
				$("cancel_0").style.display = "none";
				$.msg.alert("::Setting_Network_WPS_Msg_Success");
			}
		}
		
	});
}
