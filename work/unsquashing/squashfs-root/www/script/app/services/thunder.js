/**
 * User: Psz
 * Date: 13-10-09 18:08
 * Content: Thunder service
 */

 
function toggleSwitch(flg) {//flg 为真时 iSwitch_1 show 
	var e = $("enable");			
	e.className = flg ? "iSwitch_1" : "iSwitch_1-0";
	var dlnaSetting = $("dlnasetting");
	dlnaSetting.style.display = flg ? "block" : "none";
}
 
//初始化进入，检查是否开启
$.Ajax.get("/download.csp?fname=dld&opt=stat&function=get",function(){
	if(this.error){
		toggleSwitch(false);
		}else{
		toggleSwitch(true);
		getKey();
		}
});

//检测激活信息
//获取激活码
function getKey(){
$.msg.openLoad();
	$.Ajax.get("/download.csp?fname=dld&opt=system&function=get",function(){
	$.msg.closeLoad();
			if(!this.error){
			 var s = $.xjson(this.responseXML,"system",true);
				if(s.bind_ok==1){
					$("getKey").innerHTML = $.lge.get("Service_Thunder_removeKey");
					stut  = false; 
				}else{
					if(s.bindkey.trim() == ""){
					$("keyInfo").value = "";
					}else{
					$("keyInfo").value = s.bindkey;
					}
					stut = true;
				}
			}
		
		});
}
//解除激活码
function removeKey(){
$.msg.openLoad();
$.Ajax.get("/download.csp?fname=dld&opt=system&action=unbind&function=set",function(){
$.msg.closeLoad();
		if(!this.error){
				stut = true;
				$("getKey").innerHTML = $.lge.get("Service_Thunder_getKey");
			}
		});
}

//状态：获取和解除
//false 证明已经激活，不需要再次激活，true，需要激活
var stut;
//获取/解除按钮
$.vsubmit("getKey", function(){
		if(stut){
			getKey();
		}else{
			removeKey();
			getKey();
		}
		
});



//开启关闭
$.vsubmit("enable", function () {
	var e = $("enable"), f;
	if (e.className == "iSwitch_1") { f = 0; } else { f = 1; }
	$.msg.openLoad();
	if(f == 1){
	$.Ajax.get("/download.csp?fname=dld&opt=xl_control&action=1&function=get",function(){
	$.msg.closeLoad();
		if(!this.error){
			toggleSwitch(f);
		}
	});
	}else{
		$.Ajax.get("/download.csp?fname=dld&opt=xl_control&action=0&function=get",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError();
		}else{
			toggleSwitch(false);
		}
        });		
	}
	 
	 $.systemPadResize();
	 return false;
});



