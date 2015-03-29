/**
 * Created with JetBrains PhpStorm.
 * User: poppy
 * Date: 12-12-22
 * Time: 下午1:13
 * To change this template use File | Settings | File Templates.
 */

//备份
$.vsubmit("back",function(){
	window.open("/sysfirm.csp?fname=sysbackupform");
	return false;
});

//file
$("file").onchange = function(){
	$("re").value = this.value.trim().split(/[\/\\]+/).pop();
	$("submit").style.display = "block";
};

var iPath, iBackType;

//校验
function backVerify(){
	//校验固件
	$.Ajax.post("/protocol.csp?fname=system&opt=restore&function=set",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError();
		}
		else{
			$.systemRe("System_Back_UpInfo", 181, true);
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
			$("fSubmtForm").action = '/upload.csp?uploadpath=' +  iPath + "&file=file" + new Date().getTime() + "&session=" + (new RegExp("[?:; ]*SESSID=([^;]*);?").test(document.cookie)?RegExp["$1"]:"");
			//上传
			iBackType = null;
			($.isIE?window.frames.fSubmtForm:$("fSubmtForm")).submit();
		}
	});
	return false;
});

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
		backVerify();
	}
}