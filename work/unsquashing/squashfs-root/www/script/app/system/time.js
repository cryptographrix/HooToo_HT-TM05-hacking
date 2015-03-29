/**
* Created with JetBrains PhpStorm.
* User: WN0427
* Date: 12-12-19
* Time: 下午2:37
* To change this template use File | Settings | File Templates.
*/
var iInterval = {
	1: $.lge.get("Date_every"),
	2: 2 + " " + $.lge.get("Date_Day"),
	3: 3 + " " + $.lge.get("Date_Day"),
	4: 4 + " " + $.lge.get("Date_Day"),
	5: 5 + " " + $.lge.get("Date_Day"),
	6: 6 + " " + $.lge.get("Date_Day"),
	7: 7 + " " + $.lge.get("Date_Day")
};
$.dom.setSelect($("interval"), iInterval, null, "MSystemIntervalOpt");

var iYear = $("year"),iMonth = $("month"),iDay = $("day"),iHour = $("hour"),iMinute = $("minute"),iSecond = $("second");
function setTrueDate(){
	var xy = iYear.v,xm = iMonth.v,xd = iDay.v, x = new Date([xy,xm,xd].join("/"));
	if(xy != iYear.v){
		iYear.v = iYear.value = x.getFullYear();
	}
	var m = x.getMonth() + 1;
	if(m != iMonth.v){
		iMonth.v = m;
		iMonth.value = ("00" + m).slice(-2);
	}
	var d = x.getDate();
	if(iDay.v != d){
		iDay.v = d;
		iDay.value = ("00" + d).slice(-2);
	}
}
$.dom.setSelect(iYear, function () {
	var y = new Date().getFullYear(), r = {};
	for (var i = y - 10; i < y + 10; i += 1) {
		r[i] = i;
	}
	return r;
} (), null, "MSystemTimeOpt MSystemTimeOpt1");

$.dom.setSelect(iMonth, function () {
	var r = {};
	for (var i = 1; i < 13; i += 1) {
		r[i] = ("00" + i).slice(-2);
	}
	return r;
} (), null, "MSystemTimeOpt MSystemTimeOpt2");
iYear.vchange = iMonth.vchange = function(){
	setTrueDate();
	setDays();
};

var iDayOpts = $.dom.setSelect(iDay, function () {
	var r = {};
	for (var i = 1; i < 32; i += 1) {
		r[i] = ("00" + i).slice(-2);
	}
	return r;
} (), null, "MSystemTimeOpt MSystemTimeOpt3");

function setDays(){
	var l = iDayOpts;
	if(l[1] == null){
		return ;
	}
	if(iMonth.v == 2){
		l[30].style.display = l[31].style.display = "none";
		l[29].style.display = new Date(iYear.v + "/2/29").getDate() == 1?"none":"block";
	}
	else if(",1,3,5,7,8,10,12,".indexOf("," + iMonth.v + ",") > -1){
		l[29].style.display = l[30].style.display = l[31].style.display = "block";
	}
	else{
		l[29].style.display = l[30].style.display = "block";
		l[31].style.display = "none";
	}
}

$.dom.setSelect(iHour, function () {
	var r = {};
	for (var i = 0; i < 24; i += 1) {
		r[i] = ("00" + i).slice(-2);
	}
	return r;
} (), null, "MSystemTimeOpt MSystemTimeOpt4");

$.dom.setSelect(iMinute, function () {
	var r = {};
	for (var i = 1; i < 60; i += 1) {
		r[i] = ("00" + i).slice(-2);
	}
	return r;
} (), null, "MSystemTimeOpt MSystemTimeOpt5");

$.dom.setSelect(iSecond, function () {
	var r = {};
	for (var i = 1; i < 60; i += 1) {
		r[i] = ("00" + i).slice(-2);
	}
	return r;
} (), null, "MSystemTimeOpt MSystemTimeOpt6");

$.dom.on($("tsync_net"),"vclick",function(){
$.msg.openLoad();
 $.Ajax.get("/protocol.csp?fname=net&opt=led_status&function=get",function(){
	var x = $.xjson(this.responseXML,"led_status",true);
	if(x.internet==0){
	$.Ajax.get("/protocol.csp?fname=system&opt=time_info&syncnow=1&function=set",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError();
			//$.msg.closeLoad();
			return false;
		}
		getInfo();
	});
	return false;
	}else{
		$.msg.alert("::System_Time_Error_Sync");
		$.msg.closeLoad();
	}
 });
	
});

$.dom.on($("tsync"),"vclick",function(){
	this.className = this.className == "iSwitch_1"?"iSwitch_1-0":"iSwitch_1";
	setSync();
	return false;
});

//设置是否为同步
function setSync(){
	var s = $("tsync").className == "iSwitch_1";
	if(s){
		$("intervalWrap").style.display = "block";
		$("tsync_tt").className = "MSystemNoIpt";
	}
	else{
		$("intervalWrap").style.display = "none";
		$("tsync_tt").className = "";
	}
	iYear.canShow = iMonth.canShow = iDay.canShow = iHour.canShow = iMinute.canShow = iSecond.canShow = !s;
	$.systemPadResize();
}

$.dom.on($("daylight"),"vclick",function(){
	var tt = this.className == "iSwitch_1";
	this.className = tt?"iSwitch_1-0":"iSwitch_1";
	var xy = iYear.v,xm = iMonth.v,xd = iDay.v, xh = iHour.v*1 + (tt?-1:1), x = new Date([xy,xm,xd].join("/") + " " + xh + ":00:00");
	if(xy != iYear.v){
		iYear.v = iYear.value = x.getFullYear();
	}
	var m = x.getMonth() + 1;
	if(m != iMonth.v){
		iMonth.v = m;
		iMonth.value = ("00" + m).slice(-2);
	}
	var d = x.getDate();
	if(iDay.v != d){
		iDay.v = d;
		iDay.value = ("00" + d).slice(-2);
	}
	var h = x.getHours();
	iHour.v = x.getHours();
	iHour.value = ("00" + h).slice(-2);

	setDays();
	return false;
});

//获取所有时区
var iZone,iZonex = {};
$.Ajax.get("/protocol.csp?fname=system&opt=time_zone&function=get", function () {
	if(this.error == null) {
		iZone = $.xjson(this.responseXML, "zone");
		$.forEach(iZone,function(v,i){
			iZonex[v] = i;
		});
		$.dom.setSelect($("zone"), iZone, null, "MSystemZoneOpt");
	}
	//获取当前时间信息
	getInfo(true);
});

function getInfo(fg){
	//当前设置
	fg && $.msg.openLoad();
	$.Ajax.get("/protocol.csp?fname=system&opt=time_info&function=get",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError();
			return ;
		}
		var t = $.xjson(this.responseXML,"time_info",true);
		if(fg){
			$("zone").value = t.zone || "";
			$("zone").v = iZonex[t.zone] || 0;
			$("tsync").className = t.tsync == "1"?"iSwitch_1":"iSwitch_1-0";
			$("daylight").className = t.daylight == "1"?"iSwitch_1":"iSwitch_1-0";
			var interval =  $("interval").v = t.interval/24;
			$("interval").value = iInterval[interval];

			setSync();
		}

		iYear.v = iYear.value = t.year;
		iMonth.v = iMonth.value = t.mon;
		iDay.v = iDay.value = t.day;
		iHour.v = iHour.value = t.hour;
		iMinute.v = iMinute.value = t.min;
		iSecond.v = iSecond.value = t.sec;

	});
}

//提交设置
$.vsubmit("submit",function(){
	var tsync = $("tsync").className == "iSwitch_1";
	var pm = {};
	pm.zone = $("zone").value.trim();
	pm.daylight = $("daylight").className == "iSwitch_1"?"1":"0";
	if(tsync){
		pm.interval = (parseInt($("interval").v) || 1)*24;
		pm.tsync = String(tsync);
		pm.tserver = [
			'0.asia.pool.ntp.org',
			'1.asia.pool.ntp.org',
			'2.asia.pool.ntp.org',
			'3.asia.pool.ntp.org'
		].join("\n");
	}
	else{
		pm.year = iYear.v;
		pm.mon = iMonth.v;
		pm.day = iDay.v;
		pm.hour = iHour.v;
		pm.min = iMinute.v;
		pm.sec = iSecond.v;
	}

	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=system&opt=time_info&function=set",function(){
		if(this.error){
			$.msg.closeLoad();
			this.showError();
			return ;
		}
		getInfo();
	},pm);
	return false;
});