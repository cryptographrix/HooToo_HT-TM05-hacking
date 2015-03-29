/**
 * Created with JetBrains PhpStorm.
 * User: poppy
 * Date: 12-12-16
 * Time: 下午4:16
 * To change this template use File | Settings | File Templates.
 */

$("account").value = "guest";
//user_swicth
var lastaccount = new RegExp("[?:; ]*lastaccount=([^;]*);?").test(document.cookie) ? RegExp["$1"] : "0";
if(lastaccount.toLowerCase() == "admin"){
	$("user_swicth").style.display = "block";
}
if ($.data.account == "guest"){
	$("b_back").style.display="none";
	$("b_main").style.display="none";
}else{
	$("b_main").style.display="block";
	$("b_back").style.display = "block";	
}

if($.config.hasCheckPwd){
	$("oldPwd").style.display = "block";
}

$("lock_user").onclick = function(){
	var cn = this.className;
	cn = cn == "iSwitch_1" ? "1" : "0"; 
	setLock(cn);
}
//设置锁定用户
function setLock(l){
	$.msg.openLoad();
	var pm = {
		username : "guest",
		lock : l
	}
	$.Ajax.post("/protocol.csp?fname=security&opt=userlock&function=set",function(){
		if(this.error){ 
			this.showError();
		}else{
			var lock = $.xjson(this.responseXML,"lock",true);
			$("lock_user").className = lock == 1 ? "iSwitch_1-0" : "iSwitch_1";
			$("user_info").style.display = lock == 1 ? "none" : "block";
		}
		$.msg.closeLoad();
	},pm);
}
//获取当前是否锁定
$.Ajax.get("/protocol.csp?fname=security&opt=userlock&username=guest&function=get",function(){
		var lock = $.xjson(this.responseXML,"lock",true);
		$("lock_user").className = lock == 1 ?  "iSwitch_1-0" : "iSwitch_1";
		$("user_info").style.display = lock == 1 ? "none" : "block";
	});

$.query("#[oldpassword,password,cpassword]").on("focus",function(){
	this.className = "ipt_v";
}).on("blur",function(){
		this.className =this.value.length>0?"ipt_v":"";
});

function save(pm){
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=security&function=set",function(){
		$.msg.closeLoad();
		if(this.error == null){
			if(document.location.pathname.indexOf("/app/wizard/") >= 0) {
				$.wizard.next(true);
				return ;
			}else{
				$.msg.alert("::Setting_User_Success_Password");
			}
			var pwd1 = $("password"),pwd2 = $("cpassword"),pwd = $("oldpassword");
			pwd1.value = pwd2.value = pwd.value = "";
			pwd1.className = pwd2.className = pwd.className = "";
		}
		else{
			this.showError();
		}
	},pm);
}

$.vsubmit("submit",function(){
	var pm = {};
	pm.name = $("account").value;
	pm.opt = "pwdmod";

	var pwd1 = $("password"),pwd2 = $("cpassword");
	pm.pwd1 = pwd1.value;
	pm.pwd2 = pwd2.value;

	if($.config.hasCheckPwd){
		var pwd = $("oldpassword");
		pm.pwd = pwd.value.trim();
		/*if(pm.pwd == ""){
			$.msg.alert("::Setting_User_Old_Password_Error");
			return false;
		}*/
	}
	if(/\s/g.test(pm.pwd1))
	{
	    $.msg.alert("::Setting_User_Error2_Password",function(){
			pwd1.focus();
			
		});
		return false;
	}
	
	//if(pm.pwd1 != "" && !/^[a-zA-Z0-9]{5,32}$/.test(pm.pwd1)){
		//$.msg.alert("::Setting_User_Error_Password");
		//return false;
	//}

	if(pm.pwd1 != pm.pwd2){
	$.msg.alert("::Setting_User_Error1_Password");
		return false;
	} 

	//if(pm.pwd1 == ""){
	//	$.msg.confirm("::Setting_User_Tip3",function(){
			//save(pm);
	//	if(document.location.pathname.indexOf("/app/wizard/") >= 0) {
		//		$.wizard.next(true);
		//	}
		//});
	//}
		save(pm);
	return false;
});