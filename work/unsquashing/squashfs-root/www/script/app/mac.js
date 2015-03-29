var clientList = $("clientlist"),setTime;
//<!--lge="Setting_Network_DHCPServer_mac"-->
function getMac(){
	clearTimeout(setTime);
	$.Ajax.get("/protocol.csp?fname=net&opt=get_mac&function=get",function(){
		//this.responseXML = PUI.data.parseXML([
	//"<root><net><get_mac><total_mac>24</total_mac>",
	//	"<item><time>2014/08/11 17:1:11</time><mac>e0:06:e6:c8:68:4c</mac></item>",
	//	"<item><time>2014/08/11 17:2:11</time><mac>e0:06:e6:c8:68:4c</mac></item>",
	//	"<item><time>2014/08/11 17:3:11</time><mac>e0:06:e6:c8:68:4c</mac></item>",
	//	"<item><time>2014/08/11 17:4:11</time><mac>e0:06:e6:c8:68:4c</mac></item>",
	//	"<item><time>2014/08/11 17:5:11</time><mac>e0:06:e6:c8:68:4c</mac></item>",
	//	"<errno>0</errno></get_mac></net></root>"
	//	].join(""));
	try{
		var macList = $.xjson(this.responseXML,"mac",false),
			timeList = $.xjson(this.responseXML,"time",false),
			total_mac =  $.xjson(this.responseXML,"total_mac",false),
		macStr = '<table cellpadding="0" cellspacing="0" border="0"><thead align="center" valign="middle"><tr><td class="MNetworkDHCP_mac" rowspan="4"><b><span>MAC地址('+ total_mac +')</span></b></td><td class="MNetworkDHCP_mac" rowspan="4"><b><span>获取时间</span></b></td></tr></thead><tbody align="center" valign="middle">';
		//var date = new Date(),hh = date.getHours(),mm = date.getMinutes(),ss = date.getSeconds();
		//	if(hh < 10){
		//		hh = "0" + hh.toString();
		//	}
			//if(mm < 10){
		//		mm = "0" + mm.toString();
		//	}
		//	if(ss < 10){
		//		ss = "0" + ss.toString();
		//	}
		//	var time = date.format("YYYY-MM-DD") + "&nbsp;" + hh + ":" + mm + ":" + ss;
		for(var i = 0; i < macList.length; i++){
				//console.log(macList[i]+"___________"+time);
				macStr +="<tr><td>"+ macList[i] +"</td><td>"+ timeList[i] +"</td></tr>";			
		}
		macStr += '</tbody></table>';
		clientList.innerHTML = macStr.trim();
	}catch(e){
	
	}finally{
		setTime = setTimeout(function(){getMac()},2000);
	}
	
	
	});
};
getMac();

