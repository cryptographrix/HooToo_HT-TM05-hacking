$("loginTitle").innerHTML = $.config.title;

var div = $.query("#MMain_C_[explorer,information,user,network,services,system,wizard]").on("vclick",function(){
	var vhref = this.getAttribute("vhref");
	vhref && $.vhref(vhref);
	return false;
});

if($.data.account == "guest"){
	div.css("display","none").$.explorer.style.display = div.$.user.style.display = "block";
	$("MMain_C_user").setAttribute("vhref","user/guest.html");
}

var resizeitv;
function resize(){
	var cc = $("MMain_CC"),cw = $("MMain_C").offsetWidth, iw = $("MMain_C_user").offsetWidth;
	cc.style.width = Math.floor(cw / iw)*iw + "px";
}

$.dom.appendEvent(window,"resize",function(){
	clearTimeout(resizeitv);
	resizeitv = setTimeout(resize,100);
});

$.dom.on(window,"resize");