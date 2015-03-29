if($.isIOS){
	$("no").style.display = "block";
}
else{
	$("tip").style.display = $("upp").style.display = "block";
}
//设备系统版本号
$.Ajax.get("/protocol.csp?fname=system&opt=devinfo&function=get",function(){
	if(this.error == null){
		$("local").innerHTML = $.xjson(this.responseXML,"version",true);
	}
});

//执行刷新的时候，如果文本框还保存了路径，就显示保存按钮
if($("newLocal").value!=""){
		if(!$("submit")){
			$("submit_temp").style.display = "block";
			$("submit_temp").id= "submit";
		}else{
			$("submit").style.display = "block";
			}
	}
//file
$("file").onchange = function(){
	$("newLocal").value = this.value.trim().split(/[\/\\]+/).pop();
	if(!$("submit")){
			$("submit_temp").style.display = "block";
			$("submit_temp").id= "submit";
		}else{
			$("submit").style.display = "block";
			}

};

//升级按钮
var iPath, iBackType;

//固件校验
function firmwareVerify(){
	//校验固件
	$.Ajax.post("/protocol.csp?fname=system&opt=ckcrc_upfirm&function=set",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError();
		}
		else{
			$.systemRe("System_Firmware_UpInfo", 301, true);
		}
	},{
		path:iPath + $("file").value.trim().split(/[\/\\]+/).pop()
	});
}

//提交
$.vsubmit("submit",function(){
	$.msg.openLoad();
	//获取可用空间协议
	$.Ajax.get("/protocol.csp?fname=system&opt=update_partinfo&function=get",function(){
		if(this.error){
			$.msg.closeLoad();
			this.showError();
		}
		else{
			//上传
			iPath = $.xjson(this.responseXML,"update_partinfo",true).path;
			//$("fSubmtForm").action = '/upload.csp?uploadpath=' +  iPath + "&file=" + new Date().getTime() + "&session=" + (new RegExp("[?:; ]*SESSID=([^;]*);?").test(document.cookie)?RegExp["$1"]:"");
			$("fSubmtForm").setAttribute('action','/upload.csp?uploadpath=' +  iPath + "&file=" + new Date().getTime() + "&session=" + (new RegExp("[?:; ]*SESSID=([^;]*);?").test(document.cookie)?RegExp["$1"]:""));
			//上传
			iBackType = null;
			($.isIE?window.frames.fSubmtForm:$("fSubmtForm")).submit();
		}
	});
	return false;
});

if($("submit")){
	if($("submit").style.display=="none"){
	$("submit").id="submit_temp";
	}
}

function uploadcomplete(key,type){
	iBackType = type;
}

//升级完毕
function fLoaded(){
	if(iPath == null){
		return ;
	}

	if(iBackType){
		$.msg.closeLoad();
		$.msg.alert($.lge.get("ExpLorer_Upload_Error_" + iBackType).replace('"{#name}"',""));
	}
	else{
		firmwareVerify();
	}
}