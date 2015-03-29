var SeverName = "";
//获得URL
$.Ajax.get("/protocol.csp?fname=net&opt=qiandaoqi_url&function=get", function () {
	if (this.error == null) {
		SeverName = $("urlAdd").value = decodeURIComponent($.xjson(this.responseXML, "url", true));
	}
	else {
		$.msg.alert("获取错误");
	}
});
$.vsubmit("submit", setHostName, "#urlAdd");
//设置URL
function setHostName() {
	var url = $("urlAdd").value.trim();
	if (SeverName != url) {
			$.msg.openLoad();
			$.Ajax.post("/protocol.csp?fname=net&opt=qiandaoqi_url&function=set", function () {
				$.msg.closeLoad();
				if (this.error == null) {
					$.msg.alert("设置成功");
					SeverName = url;
				}
				else {
					$.msg.alert("设置错误");
				}
			}, {
				url: url
			});
		
	}
	return false;
}