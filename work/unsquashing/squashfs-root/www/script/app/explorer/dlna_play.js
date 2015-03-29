var Slip = function(){
	var Doc = document,
		M	= PUI.dom;

	function slipDown(self){
		if(self.isMoveing || self.isLock){
			return ;
		}
		var ev = M.getEvent();
		ev.stopPropagation();
		self.isMoveing = true;

		if(window.captureEvents){
			window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		}
		else if(self.dom.setCapture){
			self.dom.setCapture();
		}
		var cur = ev["client" + self.aspect];
		M.bind(Doc,"vmove",slipMove,self,cur);
		M.bind(Doc,"vup",slipUp,self,cur);

		self.fireEvent("start");
	}

	function slipMove(self,cur){
		window.getSelection ? window.getSelection().removeAllRanges() : Doc.selection.empty();
		var end = M.getEvent()["client" + self.aspect] - cur;
		self.fireEvent("move",end);
	}

	function slipUp(self,cur){
		if(!self.isMoveing){
			return;
		}
		//var ev = M.getEvent();
		if(window.releaseEvents){
			window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
		}
		else if(self.dom.releaseCapture){
			self.dom.releaseCapture();
		}
		//var cur = ev["client" + self.aspect] - cur;
		//self.cur = Math.min(Math.max(0,cur),self.len);

		M.unbind(Doc, "vup", slipUp);
		M.unbind(Doc, "vmove", slipMove);
		self.isMoveing = null;

		var end = M.getEvent()["client" + self.aspect] - cur;
		self.fireEvent("end",end);
	}

	return PUI.lib.extend(PUI.lib.Event,function(id,aspect){
		this.dom = M.getId(id);
		//		this.len = len || 100;
		this.aspect = aspect || "X";
		//		this.cur = 0;
		M.bind(this.dom,"vdown",slipDown,this);
	});
}();


//关闭DLNA设备列表
function closeDlnaDevice(){
	$("sel_dlna").style.display = "none";
	//if($("sel_dlnaDeviceList").innerHTML.trim() == ""){
		//$("not_dlna").style.display = "block";
	//}
}
$.dom.on($("sel_dlnaClose"),"vclick",function(){
	closeDlnaDevice();
});

//显示DLNA设备列表
function openDlnaDevice(){
	//$("not_dlna").style.display = "none";
	$("sel_dlna").style.display = "block";
}

$.dom.on($("show_DlnaDevice"),"vclick",openDlnaDevice);

var iUrl = new RegExp("[?:; ]*play=([^;]*);?").test(document.cookie + "")?decodeURIComponent(RegExp["$1"]):"";
if(iUrl == ""){
	history.back();
}

$("title").innerHTML = iUrl.split(/\/+/).pop();

//设备选择
$.dom.on($("sel_dlnaDeviceList"),"vclick",function(){
	var target = $.dom.getEvent().target;
	if(target.className == "MDLNADevice" && target.id){
		//播放设备
		getLoad(target.id,true);
		//关闭选择框
		closeDlnaDevice();
	}
});

function getDevices(isAuto){
	$.msg.openLoad();
	$.Ajax.get("/control.csp?fname=UPnP&opt=pro_get_list&function=get&r=" + new Date().getTime(),function(){
		//this.error = null;
		//this.responseXML = PUI.data.parseXML('<root><control><renderer><friendlyName>小米盒子1</friendlyName><udn>uuid:976a830e-dfe4-7bd4-ffff-ffffc7831a22</udn></renderer><errno>0</errno></control></root>');
		if(this.error){
			$("dlna_info").innerHTML= $.lge.get("DLNAPLAY_No");
			$("play_status").className = "";
			closeDlnaDevice();
		}
		else{
			var devices = $.xjson(this.responseXML,"renderer");
			if(devices.length == 0){
				closeDlnaDevice();
			}
			else{
				$("sel_dlnaDeviceList").innerHTML = $.forEach(devices,function(v){
					if(v.udn){
						return '<div class="MDLNADevice" id="' + v.udn + '">' + v.friendlyName.htmlEncode() + '</div>';
					}
					return "";
				},[]).join("");

				if(isAuto){
					//默认播放第一个
					if(devices.length > 1){
						openDlnaDevice();
					}
					else{
						//播放
						getLoad(devices[0].udn,true);
					}
				}
			}
		}
		$.msg.closeLoad();
	});
}

//刷新设备列表或者获取设备列表 //刷新DLNA列表
function refreshDevice(isAuto){
	$.msg.openLoad();
	$.Ajax.get("/control.csp?fname=UPnP&opt=pro_sync&function=get&r=" + new Date().getTime(),function(){
		if(this.error){
			closeDlnaDevice();
			$.msg.closeLoad();
		}
		else{
			setTimeout(function(){
				getDevices(isAuto);
				$.msg.closeLoad();
			},1000*3);
		}
	});
}
$.dom.on($("sel_dlnaRefresh"),"vclick",function(){
	refreshDevice();
});

//初始获取播放信息
function getLoad(udn,flag){
	$.msg.openLoad();
	//获取视频播放信息协议
	///control.csp?fname=UPnP&opt=pro_transport_info&udn=&function=get
	$.Ajax.get("/control.csp?fname=UPnP&opt=pro_transport_info&udn="+udn+"&function=get",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError(function(){
				openDlnaDevice();
			});
			$.msg.closeLoad();
		}
		else{
			$("dlna_info").innerHTML = $.lge.get("DLNAPLAY_Connect").replace(/\{#name\}/gi,$(udn).innerHTML);
			var iplayInfo = $.xjson(this.responseXML,"pro_transport_info",true);
			var state = iplayInfo.CurrentTransportState;
			iPlayStatus = state=="PLAYING"?1:-1;//state=="PAUSED_PLAYBACK"?-1:0;
			$("play_status").className = iPlayStatus == 1?"press":"";
			iUdn = udn;
			moveInofGet();
			if(flag){
				if(iPlayStatus == 1){
					getVolume(true);
					$.msg.confirm("::DLNAPLAY_Replace",function(){
						setPlay(udn);
					});
				}
				else{
					setPlay(udn);
				}
			}
		}
	});
}
			
var iUdn,iPlayStatus = 0;
function getVolume(flag){
	if(flag){
	//======PS=============后台应该在连接到设备时，将当前设备的音量返回出来==============================================
				//音量的高度  $("volume_h").style.height   0~140 px
				/*
				 12、获取音量协议
				 http://ip:8201/control.csp?opt=pro_getvolume =&und=&function=get
				 协议返回：
				 <root>
				 　　<control>
				 　　<CurrentVolume>8</CurrentVolume>
				 　　<errno>0</errno>
				 　　</control>
				 </root>
				 设置失败返回错误代码：错误代码待定
				 CurrentVolume：表示当前音量大小
				 */
				$.Ajax.get("/control.csp?fname=UPnP&opt=pro_getvolume&udn=" + iUdn + "&function=get",function(){
					if(this.error == null){
						var v = $.xjson(this.responseXML,"CurrentVolume",true);
						if(v){
							$("volume_h").style.height = Math.min(Math.max(0,v*1.4),140) + "px";
						}
					}
				});
	}				
}
function startPlay(){
	if(iPlayStatus == -1){
		$.msg.openLoad();
		//视频播放协议
		//http://ip:8201/control.csp?opt=pro_play &udn=&function=set
		$.Ajax.post("/control.csp?fname=UPnP&opt=pro_play&udn=" + iUdn + "&function=set",function(){
			if(this.error){
				this.showError();
			}
			else{
				iPlayStatus = 1;
				$("play_status").className = "press";
				//获取信息
				moveInofGet();
			}
			$.msg.closeLoad();
		});
	}
}

function pausePlay(){
	if(iPlayStatus == 1){
		//暂停视频协议
		//http://ip:8201/control.csp?opt=pro_pause &udn=&function=set
		$.msg.openLoad();
		$.Ajax.post("/control.csp?fname=UPnP&opt=pro_pause&udn="+ iUdn +"&function=set",function(){
			$.msg.closeLoad();
//			this.error = null;
			if(this.error){
				this.showError();
			}
			else{
				iPlayStatus = -1;
				$("play_status").className = "";
			}
		});
	}
}

//设置播放视频
function setPlay(udn){
	$.msg.openLoad();
	$.Ajax.post("/control.csp?fname=UPnP&opt=pro_setplayuri&udn="+udn+"&CurrentURI="+encodeURI(iUrl)+"&local=1&function=set",function(){
		//this.error = null;
		if(this.error){
			this.showError();
		}
		else{
			//$("play_1").innerHTML = "00:00:00";
			//$("play_progress").style.width = "0px";
			iUdn = udn;
			startPlay();
		}
		$.msg.closeLoad();
	});
}
$.dom.on($("play_status"),"vclick",function(){
	if(iPlayStatus == 1){
		pausePlay();
	}
	else if(iPlayStatus == -1){
		startPlay();
	}
});


function setPress(p,up){
	if(p){
		$("play_progress_cot").setAttribute("progress",p);
	}
	if(xSlipWidth == null){
		if(p == null){
			p = $("play_progress_cot").getAttribute("progress");
			if(iMaxTime && up){
				var x = (iMaxTime * p + up)/iMaxTime;
				if(x){
					p = x;
				}
			}
		}
		if(p){
			var w = $("play_progress_cot").offsetWidth - 13;
			$("play_progress").style.width = Math.max(Math.floor(w*p),0) + "px";
		}
	}
}

//进度自动走
//setInterval(function(){
	//播放时，并且存在最大进度时
//	if(iPlayStatus == 1 && iMaxTime){
//		setPress(null,1);
//	}
//},1000);

window.onresize = function(){
	setPress();
};
//$("play_progress").style.width = "0px";
//$("play_1").innerHTML = "00:00:00";
$.dom.on($("play_progress_cot"),"vdown",function(){
	var ev = $.dom.getEvent();
	var left = ev.clientX - 100;
	var p = Math.min(1,left/(this.offsetWidth - 13));
	setPress(p);
	ajaxSeek.submit(p);
});
//$.dom.on($("play_progress"),"vdown",function(){
//	$.dom.getEvent().stopPropagation();
//});
var xSlip = new Slip("play_progress_ico","X"),xSlipWidth = null;
xSlip.onStart = function(){
	xSlipWidth = $("play_progress").style.width.replace(/\D/g,"")*1 || 0;
};
xSlip.onMove = function(skewing){
	//	alert(skewing);
	var x = xSlipWidth + skewing,max = $("play_progress_cot").offsetWidth - 13;
	//alert(x);
	x = Math.max(Math.min(max,x),0);
	//	alert(x);
	$("play_progress").style.width = x + "px";
	return x;
};
xSlip.onEnd = function(skewing){
	var x = xSlip.onMove(skewing);
	var p = Math.min(1,x/($("play_progress_cot").offsetWidth - 13));
	xSlipWidth = null;
	setPress(p);
	ajaxSeek.submit(p);
};

//设置进度
//p为百分比
var ajaxSeek = new $.Ajax("","POST").extend({
	onCallBack:function(){
//		this.error = null;
		if(this.error){
			this.showError();
		}
		moveInofGet();
	},
	submit:function(p){
		if(iMaxTime && iUdn){
			var t = Math.floor(iMaxTime*p);
			var s = t % 60;
			var m = Math.floor(t / 60) % 60;
			var h = Math.floor(t / 3600);
			var Target = ("00" + h).slice(-2) + ":" + ("00" + m).slice(-2) + ":" + ("00" + s).slice(-2);
			this.url = "/control.csp?fname=UPnP&opt=pro_seek&udn="+ iUdn +"&Target="+ Target +"&function=set";
			this.send(null,null,true);
		}
	}
});

//获取视频播放信息协议
var moveInfoITV,iMaxTime = 0;

function moveInofGet(){
	clearTimeout(moveInfoITV);
	if(iPlayStatus == 1 && iUdn){
		//if(flag === true){
		//	$.msg.openLoad();
		//}
		$.Ajax.get("/control.csp?fname=UPnP&opt=pro_getinfo&udn="+ iUdn +"&function=set",function(){
			//表示正在设置进度，暂时不更新后台返回的进度
			if(this.error){
				this.showError();
				$("play_status").className = "";
				clearTimeout(moveInfoITV);
				return;
			}
			if(ajaxSeek.XHR){
				moveInfoITV = setTimeout(moveInofGet,1000);
				return ;
			}
			//if(flag === true){
			//	$.msg.closeLoad();
			//}
//			this.error = null;
//			this.responseXML = PUI.data.parseXML('<root><control><TrackDuration>00:58:45</TrackDuration><TrackURI>http://192.168.1.141:8200/MediaItems/30</TrackURI><RelTime>00:28:45</RelTime><RelCount>2147483647</RelCount><errno>0</errno></control></root>');
				var x = $.xjson(this.responseXML,"pro_getinfo",true);
				$("play_1").innerHTML = x.RelTime;
				$("play_0").innerHTML = x.TrackDuration;
				$("title").innerHTML = decodeURIComponent(x.TrackURI.split("/").pop());
				var r = x.RelTime.split(":"),rx = r.pop()*1 || 0;
				rx += r.pop()*60 || 0;
				rx += r.pop()*3600 || 0;
				var t = x.TrackDuration.split(":"),tx = t.pop()*1 || 0;
				tx += t.pop()*60 || 0;
				tx += t.pop()*3600 || 0;
				iMaxTime = tx;
				setPress(rx/tx);

			if(x.RelTime != x.TrackDuration){
				moveInfoITV = setTimeout(moveInofGet,3000);
			}
			else if(x.TrackDuration == "00:00:00" && x.RelTime == "00:00:00"){
				$("play_progress").style.width = "0px";
				moveInfoITV = setTimeout(moveInofGet,1000);
			}else{
				$("play_status").className = "";
			}
		});
	}
};

//音量设置
var iSlip = new Slip("volume_y","Y"),nSlipWidth;
iSlip.onStart = function(){
	nSlipWidth = $("volume_h").style.height.replace(/\D/g,"")*1 || 0;
//	alert(nSlipWidth);
};
iSlip.onMove = function(skewing){
	//	alert(skewing);
	var x = nSlipWidth + skewing*-1;
	//alert(x);
	x = Math.max(Math.min(140,x),0);
	//	alert(x);
	$("volume_h").style.height = x + "px";
	return x;
};
iSlip.onEnd = function(skewing){
	var x = iSlip.onMove(skewing);
	//设置音量
	if(iUdn){
        iSlip.isLock = true;
		$.Ajax.post("/control.csp?fname=UPnP&opt=pro_setvolume&udn="+ iUdn +"&function=set",function(){
			//this.error = null;
            iSlip.isLock = false;
			if(this.error){
				//失败还原
				$("volume_h").style.height = nSlipWidth + "%";
				this.showError();
			}
		},{
			DesiredVolume:Math.min(100,Math.round(x/1.4))
		});
	}
};


getDevices(true);