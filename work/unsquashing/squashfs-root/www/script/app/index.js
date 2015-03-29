var iLge = $.lge.getSe();
if($.config.logoTitle==null){
$("loginTitle").innerHTML = $.config.title;
}else{
$("loginTitle").innerHTML = $.config.logoTitle;
}
$.query("#[account,password]").on("focus",function(){
	this.className = "ipt_v";
}).$.account.value = (new RegExp("[?:; ]*lastaccount=([^;]*);?").test(document.cookie) ? RegExp["$1"] : "") || "admin";

$.query("#[account,password,language]").on("blur",function(){
		this.className =this.value.length>0?"ipt_v":"";
})[2].vchange = function(){
	if(iLge != this.v){
		iLge = this.v;
		$.lge.use(iLge);
	}
};
var loge_user = {
	"admin" : "admin",
	"guest" : "guest"
}
loge_user.UserName = $.dom.setSelect($("account"), loge_user,loge_user.admin,"MEntry_OptUser");

$.dom.setSelect($("language"),function(x,z){
	for(var i = 0,y = {};i< x.length;i+=1){
		y[x[i]] =  '<b class="l_' + x[i] + '">' + z[x[i]] + '</b>';
	}
	return y;
}($.config.language, $.config.languageName),iLge,"MEntry_OptLge");
if($.config.img_lge){
	$("language_icon").innerHTML = $.lge.get("[img_lge]" + iLge + ".jpg");
	$("language").vchange = function(){
		if(iLge != this.v){
		iLge = this.v;
		$.lge.use(iLge);
		}
		$("language_icon").innerHTML = $.lge.get("[img_lge]" + this.v + ".jpg");
	};
}
//验证Gaust是否开启
$.Ajax.get("/protocol.csp?fname=security&opt=userlock&username=guest&function=get",function(){
 var lock = $.xjson(this.responseXML,"lock",true);
	loge_user.UserName.guest.style.display = lock == 1 ? "none" : "block";
});
//登录
$.vsubmit("submit",function(){
	var pm = {
		fname:"security",
		opt:"pwdchk"
	};

	/* 帐号 */
	pm.name = $("account").value.trim();
	if(pm.name==""){
		$("account").focus();
		return false;
	}

	/* 密码 */
	pm.pwd1 = $("password").value;

	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?function=set",function(){
		$.msg.closeLoad();
		if(this.error){
			if(this.error.code == "20104030"){
				$("password").value = "";
				$("password").focus();
				}
			//用户锁定时
			if(this.error.code == "20104033"){
				$.msg.alert("::20104030");
				return false;
			}
			this.showError(function(){
				//alert(11);
				$("password").focus();
			});
			return false;
		}
		$.lge.save();
		$.data.account = pm.name;
		document.cookie = "lastaccount=" + pm.name + "; expires=" + new Date("2099/12/31").toGMTString() + "; path=/";
		document.cookie = "hasfirmcheck=1; path=/";
		$.systemMain();
		return false;
	},pm);
	return false;
});