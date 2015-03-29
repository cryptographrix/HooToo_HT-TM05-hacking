/**
 * User: psz
 * Date: 14-05-27
 * Time: AM 10:00
 */
  //3g
  var i3G = {};
 //获取3g信息
 function get3G(){
	 $.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_3g&function=get&encode=1",function(){
		$.msg.closeLoad();
		if(!this.error){
			i3G = $.xjson(this.responseXML,"wifi_3g",true);
			$("3g-apn").value = decodeURIComponent(i3G.apn || "");
			$("3g-number").value = decodeURIComponent(i3G.number || "");
			$("3g-user").value = decodeURIComponent(i3G.user || "");
			$("3g-passwd").value = decodeURIComponent(i3G.passwd || "");
			$("3g-status").innerHTML = $.lge.get("Setting_Network_Internet_3G_Status_" + (i3G.status=="1"?"1":"0"));
			}
	 });
 };
 get3G();
 
 
    //设置3g信息
 function set3G(pm){
	 $.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_3g&function=set&encode=1",function(){
		if(!this.error){
			get3G();
		}
		$.msg.closeLoad();
	},pm);
 
 }
	//保存
	$.vsubmit("submit", function () {
		var pm = {};
	 	pm.apn = $("3g-apn").value.trim();
		pm.number =  $("3g-number").value.trim();
		pm.user = $("3g-user").value.trim();
		pm.passwd = $("3g-passwd").value.trim();
		set3G(pm);
	});
 