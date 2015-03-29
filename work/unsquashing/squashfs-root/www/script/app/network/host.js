var SeverName;
//获得主机名称
$.Ajax.get("/protocol.csp?fname=system&opt=host&function=get&encode=1", function () {
	if (this.error == null) {
		SeverName = $("hostname").value = decodeURIComponent($.xjson(this.responseXML, "host", true).name);
		$.vsubmit("submit", setHostName, "#hostname");
	}
	else {
		this.showError();
	}
});

//设置
function setHostName() {
	var name = $("hostname").value.trim();
	if (SeverName != name) {
		if (/^[a-zA-Z][a-zA-Z0-9\-]{1,7}$/.test(name)) {
			$.msg.openLoad();
			$.Ajax.post("/protocol.csp?fname=system&opt=host&function=set&encode=1", function () {
				$.msg.closeLoad();
				if (this.error == null) {
					SeverName = name;
				}
				else {
					this.showError();
				}
			}, {
				name: name
			});
		}
		else {
			$.msg.alert("::Setting_HostName_Tip2");
		}
	}
	return false;
}