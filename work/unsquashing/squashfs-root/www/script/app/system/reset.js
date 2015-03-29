$.vsubmit("enable", function () {
	var e = $("enable");
	e.className = e.className == "iSwitch_1-0" ? "iSwitch_1" : "iSwitch_1-0";
	$("submit").style.display = e.className == "iSwitch_1-0" ? "none" : "block";
	return false;
});
$.vsubmit("submit", function () {
	$.msg.confirm("::System_Reset_Is_Default", function () {
		$.msg.confirm("::System_Reset_Is_Default2", function () {
			$.Ajax.get("/protocol.csp?fname=system&opt=setting&action=default&function=set&r=" + Math.random());
			$.systemRe("System_Reset_Default", 180, true);
		});
	});
	return false;
});