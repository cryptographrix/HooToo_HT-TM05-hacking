//设置信息
var iDHCP;

function getTime(t) {
	var s = t % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 60 / 60);
	return ("00" + h).slice(-2) + ":" + ("00" + m).slice(-2) + ":" + ("00" + s).slice(-2);
}

function checkIPError(dom, lge, isEmpty) {
	var v = dom.value.trim();
	if (isEmpty && v == "") {
		return v;
	}
	if(v == ""){
		$.msg.alert(["::" + lge, "::Setting_DDNS_NotEmpty"]);
		return null;
	}
//	if(!/^([1-9]{1,2}|[1-9]0{1}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.([1-9]{1,2}|[1-9]0{1}|1\d\d|2[0-4]\d|25[0-4])$/.test(v)) {
    if(!/^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-4])))\.)(([1-9]|([1-9]\d)|(\d)|(1\d\d)|(2([0-4]\d|5[0-5])))\.){2}([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-4])))$/.test(v)){	
		$.msg.alert(["::" + lge, "::Setting_Network_DHCPServer_error"],function(){
		dom.focus();
		});

		return null;
	}
	return v;
}
//验证和获取网关地址给连接池起始和结束
function _getGateway(){
		var v;
		if((v = checkIPError($("gateway"),"Setting_Network_DHCPServer_gateway"))==null){
			return ;
		}
	v = v.replace(/\.\d+$/,"");
	var s = $("start").value.trim().split(".");
	$("start").value = s.length < 4?v+".1":(v + "." + s[3]);
	var e = $("end").value.trim().split(".");
	$("end").value = e.length < 4?v+".50":(v + "." + e[3]);
}
$("gateway").onblur = function(){
	_getGateway();
	};
$("start").onblur = function(){
	_getGateway();
};	
$("end").onblur = function(){
    _getGateway();
};


//保存
$.vsubmit("submit", function () {
	var pm = {
		action: $("enable").className == "iSwitch_1" ? 1 : 0
	};
	if ( pm.action == 1){	//关闭dhcp时，不需要校验dhcp地址参数
		if ((pm.start = checkIPError($("start"), "Setting_Network_DHCPServer_start")) == null) {
		return false;
	}
	if ((pm.end = checkIPError($("end"), "Setting_Network_DHCPServer_end")) == null) {
		return false;
	}
	if ((pm.gateway = checkIPError($("gateway"), "Setting_Network_DHCPServer_gateway")) == null) {
		return false;
	}
	if ((pm.DNS1 = checkIPError($("DNS1"), "Setting_Network_DHCPServer_primary")) == null) {
		return false;
	}
	if($("DNS2").value.trim()=="0.0.0.0"){$("DNS2").value="";}
	if ((pm.DNS2 = checkIPError($("DNS2"), "Setting_Network_DHCPServer_second", true)) == null) {
		return false;
	}
	if ( +pm.start.split(".")[3] >= +pm.end.split(".")[3] ){
		$.msg.alert("::Setting_Network_DHCPServer_startaddress_error",function(){
		$("start").focus();
		});
		return false;
	}
	if(+pm.gateway.split(".")[3] >= +pm.start.split(".")[3] && +pm.gateway.split(".")[3] <= +pm.end.split(".")[3]){
		$.msg.alert(["::Setting_Network_DHCPServer_gateway","::Setting_Network_DHCPServer_error"],function(){
			$("gateway").focus();
		});
		return false;
	}

	var flag;
	for (var n in pm) {
		if (pm[n] != iDHCP[n]) {
			flag = true;
			break;
		}
	}
	//alert(flag);
	if (flag == null) {
		return false;
	}
	}			//end 
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=net&opt=wifi_dhcpd&function=set", function () {
		//flg = 1;
		if (this.error == null) {
				var item = $.xjson(this.responseXML, "wifi_dhcpd", true);
				$("start").value = item.start;
				$("end").value = item.end;
				$("gateway").value = item.gateway;
				$("DNS1").value = item.DNS1;
				$("DNS2").value = item.DNS2;

			$.Ajax.post("/protocol.csp?fname=net&opt=wifi_active&function=set&active=wifi_dhcpd", function () {
				if (this.error == null) {
					iDHCP = pm;
				}
				else {
					this.showError();
				}
				$.msg.closeLoad();
			});
		}
		else {
			this.showError();
			$.msg.closeLoad();
		}
	}, pm);
	return false;
}, "[start,end,gateway,DNS1,DNS2]");

//获取模式
var iMode;
$.Ajax.get("/protocol.csp?fname=net&opt=wifi_phymode&function=get", function () {
	if (this.error == null) {
		iMode = parseInt($.xjson(this.responseXML, "wifi_phymode", true).mode) || 0;
		if (iMode != 0) {
			getDHCP(true);
		}
	}
	else {
		this.showError();
	}
});
$.vsubmit("enable", function () {
	var e = $("enable"), f;
	if (e.className == "iSwitch_1") { f = 0; } else { f = 1; }
	toggleSwitch(f);
	$.systemPadResize();
});
$.vsubmit("list", function () {
	var df = $("dhcpform");
	var client = $("client");
	df.style.display = "none";
	client.style.display = "block";
});
$.vsubmit("back", function () {
	var df = $("dhcpform");
	var client = $("client");
	df.style.display = "block";
	client.style.display = "none";
});
function toggleSwitch(flg) {
	var e = $("enable");
	e.className = flg ? "iSwitch_1" : "iSwitch_1-0";
	var dhcpSetting = $("dhcpsetting");
	dhcpSetting.style.display = flg ? "block" : "none";
	var list = $("list");
	list.style.display = flg ? "inline-block" : "none";
	if(e.className=="iSwitch_1-0"){$("submit").style.width="100%";}else{$("submit").style.width="49%";}
	

}
function getDHCP(flg) {
	//获取信息
	$.Ajax.get("/protocol.csp?fname=net&opt=wifi_dhcpd&function=get", function () {
		//this.error = null;
		//this.responseXML = PUI.data.parseXML('<?xml version="1.0" ?><root><net><wifi_dhcpd><status>1</status><start>192.168.1.100</start><end>192.168.1.200</end><gateway>192.168.1.1</gateway><DNS1>192.168.1.1</DNS1><DNS2>8.8.8.8</DNS2><client><id>1</id><name>iovst</name><mac>11:22:33:44:55:66</mac><ip>192.168.1.100</ip><keep-alive>86400</keep-alive></client><errno>0</errno></wifi_dhcpd></net></root>');
		if (this.error) {
			flg && this.showError();
			return;
		}

		if (flg) {
			iDHCP = $.xjson(this.responseXML, "wifi_dhcpd", true);
			delete iDHCP["client"];
			delete iDHCP["errno"];
			$("start").value = iDHCP.start || "";
			$("end").value = iDHCP.end || "";
			$("gateway").value = iDHCP.gateway || "";
			$("DNS1").value = iDHCP.DNS1 || "";
			$("DNS2").value = iDHCP.DNS2 || "";
			if(iDHCP.DNS2.trim()=="0.0.0.0"){$("DNS2").value="";}
			iDHCP.action = Number(iDHCP.status) || 0;
			toggleSwitch(iDHCP.action);
			//两分钟刷新列表
			setTimeout(function () {
				getDHCP();
			}, 120000);
		}
		//列表 tbody 不支持直接插入 html -_-
		var clist = $("clientlist");
		$.dom.clear(clist);
		$.forEach($.xjson(this.responseXML, "client"), function (v) {
			$.dom.create(["tr", {}, [
				["td",{},v.name.htmlEncode()],
				["td",{},v.mac],
				["td",{},v.ip],
				["td",{className:"MNetworkDHCP_time"},getTime(v["keep-alive"])]
			]], clist);
		});
		$.systemPadResize();
		//        var list = $.xjson(this.responseXML, "client"), p = [];
		//        for (var i = 0; i < list.length; i++) {
		//            p.push("<tr><td>" + list[i].id + "</td><td>" + list[i].name + "</td><td>" + list[i].age + "</td><td>" + list[i].address + "</td></tr>");
		//        }
		//        $("clientlist").innerHTML = p.join("");
	});
}