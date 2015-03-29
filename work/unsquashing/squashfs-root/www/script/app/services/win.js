//语言设置
var iEnable = false;

$.Ajax.get("/protocol.csp?fname=service&opt=smb&function=get",function(){
	if(this.error == null){
		iEnable = $.xjson(this.responseXML,"smb",true).enable == "1";
		$("enable").className = iEnable?"iSwitch_1":"iSwitch_1-0";
	}
});

function updata(able){
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=service&opt=smb&function=set",function(){
		$.msg.closeLoad();
		if(this.error == null){
			iEnable = able;
		}
	},{
		action:able?1:0
	});
}

$.vsubmit("enable",function(){
	this.className = this.className == "iSwitch_1"?"iSwitch_1-0":"iSwitch_1";
	return false;
});

//如果您关闭Windows共享服务，您将不能访问Windows共享，您确定关闭Windows共享服务吗？
$.vsubmit("submit",function(){
	var eb = $("enable").className == "iSwitch_1";
	if(eb == iEnable){
		return false;
	}

	if(!eb){
		$.msg.confirm("::Service_Win_Tip",function(){
			updata(eb);
		});
	}
	else{
		updata(eb);
	}
	return false;
});