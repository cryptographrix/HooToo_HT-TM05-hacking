$("account").value = $.data.account;

if ($.data.account == "guest"){
	$("h_back").style.display = "none";
}
if($.config.hasCheckPwd){
	$("oldPwd").style.display = "block";
}

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
	//if(pm.pwd1==""){
		//$.msg.alert("::Setting_User_Error_CPassword",function(){
		//	pwd1.focus();
		//});
		//return false;
	//}

	//if(!/^[a-zA-Z0-9]{5,32}$/.test(pm.pwd1)){
		//$.msg.alert("::Setting_User_Error_Password",function(){
		//	pwd1.focus();
		//});
		//return false;
	//}
	if(pm.pwd1 != pm.pwd2){
		$.msg.alert("::Setting_User_Error1_Password");
		return false;
	}

	save(pm);
	/*if(document.location.pathname.indexOf("/app/wizard/") >= 0) {
			$.wizard.next(true);
	}
	*/	
	return false;
});