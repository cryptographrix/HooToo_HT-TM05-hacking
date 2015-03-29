var Slip = function(){
	var Doc = document,
		M	= PUI.dom;

	function slipDown(self){
		if(self.isMoveing){
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

(function() {var chrome = window.chrome || {};
	chrome.cast = chrome.cast || {};
	chrome.cast.media = chrome.cast.media || {};
	chrome.cast.ApiBootstrap_ = function() {
	};
	chrome.cast.ApiBootstrap_.EXTENSION_IDS = ["boadgeojelhgndaghljhdicfkmllpafd", "dliochdbjfkdbacpmhlcpmleaejidimm", "hfaagokkkhdbgiakmmlclaapfelnkoah", "fmfcbgogabcbclcofgocippekhfcmgfj", "enhhojjnijigcajfphajepfemndkmdlo"];
	chrome.cast.ApiBootstrap_.findInstalledExtension_ = function(callback) {
		chrome.cast.ApiBootstrap_.findInstalledExtensionHelper_(0, callback);
	};
	chrome.cast.ApiBootstrap_.findInstalledExtensionHelper_ = function(index, callback) {
		index == chrome.cast.ApiBootstrap_.EXTENSION_IDS.length ? callback(null) : chrome.cast.ApiBootstrap_.isExtensionInstalled_(chrome.cast.ApiBootstrap_.EXTENSION_IDS[index], function(installed) {
			installed ? callback(chrome.cast.ApiBootstrap_.EXTENSION_IDS[index]) : chrome.cast.ApiBootstrap_.findInstalledExtensionHelper_(index + 1, callback);
		});
	};
	chrome.cast.ApiBootstrap_.getCastSenderUrl_ = function(extensionId) {
		return "chrome-extension://" + extensionId + "/cast_sender.js";
	};
	chrome.cast.ApiBootstrap_.isExtensionInstalled_ = function(extensionId, callback) {
		var xmlhttp = new XMLHttpRequest;
		xmlhttp.onreadystatechange = function() {
			4 == xmlhttp.readyState && 200 == xmlhttp.status && callback(!0);
		};
		xmlhttp.onerror = function() {
			callback(!1);
		};
		xmlhttp.open("GET", chrome.cast.ApiBootstrap_.getCastSenderUrl_(extensionId), !0);
		xmlhttp.send();
	};
	chrome.cast.ApiBootstrap_.findInstalledExtension_(function(extensionId) {
		if (extensionId) {
//			console.log("Found cast extension: " + extensionId);
			chrome.cast.extensionId = extensionId;
			var apiScript = document.createElement("script");
			apiScript.src = chrome.cast.ApiBootstrap_.getCastSenderUrl_(extensionId);
			(document.head || document.documentElement).appendChild(apiScript);
		} else {
			var msg = "No cast extension found";
//			console.log(msg);
			var callback = window.__onGCastApiAvailable;
			callback && "function" == typeof callback && callback(!1, msg);
		}
	});
})();

var chrome = window.chrome;
var session;
var timer;
var isAvailable;
var host = window.location.host;
var currentMedia;
var MediaURL = new RegExp("[?:; ]*play=([^;]*);?").test(document.cookie + "")?'http://' + host + decodeURIComponent(RegExp["$1"]):"";
//var MediaURL = 'http://192.168.1.102/CastVideos/paparazzi.MP4';
if(MediaURL == ""){
	history.back();
}
$("title").innerHTML = MediaURL.split(/\/+/).pop();

function mediaCommandSuccessCallback(info) {
	console.log(info);
//	appendMessage(info);
}

function makeTimeTxt(time){
	var x = [];
	x[0] = Math.floor(time / 60 / 60);
	x[1] = Math.floor(time / 60 % 60);
	x[2] = Math.floor(time % 60);
	return x.join(':');
}

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
function onSeekSuccess() {
//	setTimeout(function(){progressFlag = 1},1500);
}
xSlip.onEnd = function(skewing){
	var x = xSlip.onMove(skewing);
	var p = Math.min(1,x/($("play_progress_cot").offsetWidth - 13));
	xSlipWidth = null;
	setPress(p);
	setPressCast(p);
};

function setPressCast(p){
	if(currentMedia){
		var request = new chrome.cast.media.SeekRequest();
		request.currentTime = p * currentMedia.media.duration;
		currentMedia.seek(request,
			onSeekSuccess,
			onError);
	}
}

function setPress(p){
	if(currentMedia){
		if(p){
			$("play_progress_cot").setAttribute("progress",p);
		}
		if(xSlipWidth == null){
			var max = currentMedia.media.duration;
			if(p == null){
				p = $("play_progress_cot").getAttribute("progress");
				if(iMaxTime){
					var x = (max * p)/max;
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
}

window.onresize = function(){
	setPress();
};

$.dom.on($("play_progress_cot"),"vdown",function(){
	var ev = $.dom.getEvent();
	var left = ev.clientX - 100;
	var p = Math.min(1,left/(this.offsetWidth - 13));
	setPress(p);
	setPressCast(p);
});

//播放进度
function updateCurrentTime() {
//	console.log(session,currentMedia);
	if (!session || !currentMedia) {
		$("dlna_info").innerHTML = $.lge.get("CastPlay_NoConnect");
		return;
	}
	$("dlna_info").innerHTML = $.lge.get("CastPlay_Connect");
	if (currentMedia.media && currentMedia.media.duration != null) {
		var cTime = currentMedia.getEstimatedTime();
//		console.log(cTime);
		setPress(cTime / currentMedia.media.duration);
		$("play_1").innerHTML = makeTimeTxt(cTime);
	}
	else {
		setPress(0);
		$("play_1").innerHTML =  makeTimeTxt(0);
		if( timer ) {
			clearInterval(timer);
		}
	}
}
function stopCurrentTime(){
	clearInterval(timer);
	$("dlna_info").innerHTML= .lge.get("Setting_DDNS_Fail");
}
function startCurrentTime(){
	clearInterval(timer);
	timer = setInterval(updateCurrentTime.bind(this), 1000);
}

//载入视频
function loadMedia() {
	if (!session) {
		console.log("no session");
//		appendMessage("no session");
		return;
	}

	var mediaInfo = new chrome.cast.media.MediaInfo(MediaURL);
	mediaInfo.contentType = 'video/' + MediaURL.split('.').pop();
//	mediaInfo.contentType = 'application/vnd.rn-realmedia-vbr';
	console.log(mediaInfo);
	var request = new chrome.cast.media.LoadRequest(mediaInfo);
	request.autoplay = false;
	request.currentTime = 0;

	//var payload = {
	//  "title:" : mediaTitles[i],
	//  "thumb" : mediaThumbs[i]
	//};

	//var json = {
	//  "payload" : payload
	//};

	//request.customData = json;

	session.loadMedia(request,
		function(){
			if (session.media.length != 0) {
				onMediaDiscovered('loadMedia', session.media[0]);
			}
			playMedia();
		},
		onMediaError);
}

/**
 * play media
 */
function playMedia() {
	console.log(currentMedia);
	if( !currentMedia )
		return;

//	stopCurrentTime();

	var playpauseresume = document.getElementById("play_status");
	currentMedia.play(null,
		mediaCommandSuccessCallback.bind(this,"resumed " + currentMedia.sessionId),
		onError);
	playpauseresume.className = 'press';
	startCurrentTime();
}

function pauseMedia() {
	if( !currentMedia )
		return;

	stopCurrentTime();

	var playpauseresume = document.getElementById("play_status");
	currentMedia.pause(null,
		mediaCommandSuccessCallback.bind(this,"paused " + currentMedia.sessionId),
		onError);
	playpauseresume.className = 'play';
}

/**
 * stop app/session
 */
function stopApp() {
	if(session){
		session.stop(function(){
			document.location.reload();
		}, onError);
		stopCurrentTime();
	}
}

/**
 * session listener during initialization
 */
function sessionListener(e) {
//	console.log('New session ID: ',e);
	session = e;
	if (e.media.length != 0) {
		onMediaDiscovered('sessionListener', e.media[0]);
	}
	playMedia();
//	console.log(session);
//	session.addMediaListener(onMediaDiscovered.bind(this, 'addMediaListener'));
//	session.addUpdateListener(sessionUpdateListener.bind(this));
}

/**
 * session update listener
 */
function sessionUpdateListener(isAlive) {
//	var message = isAlive ? 'Session Updated' : 'Session Removed';
//	message += ': ' + session.sessionId;
//	appendMessage(message);
	if (!isAlive) {
		session = null;
//		document.getElementById("casticon").src = 'images/cast_icon_idle.png';
		//var playpauseresume = document.getElementById("play_status");
		//playpauseresume.className = 'play';
		if( timer ) {
			stopCurrentTime();
		}
		else {
			startCurrentTime();
//			playpauseresume.innerHTML = 'press';
		}
	}
}
function onMediaDiscovered(how, media) {
	console.log("--new media session ID:",'--' + how,media,timer);
	currentMedia = media || how;
	if(currentMedia.media.contentId != MediaURL){
		stopApp();
//		currentMedia = null;
		return ;
	}
	currentMedia.addUpdateListener(onMediaStatusUpdate);
	startCurrentTime();
	var playpauseresume = document.getElementById("play_status");
	playpauseresume.className = currentMedia.playerState == 'PAUSED'?'play':'press';
	setMediaVolumeShow();
}

function onMediaError(e) {
	console.log("media error",e);
//	appendMessage("media error");
//	document.getElementById("casticon").src = 'images/cast_icon_warning.png';
}

function onMediaStatusUpdate(isAlive) {
	$("play_status").className == 'press';
	if( currentMedia ) {
		setPress(currentMedia.currentTime / currentMedia.media.duration);
		$('play_0').innerHTML =  makeTimeTxt(currentMedia.media.duration);
	}
}

function onRequestSessionSuccess(e) {
	console.log("session success: " + e.sessionId);
//	appendMessage("session success: " + e.sessionId);
	session = e;
//	console.log(session);
//	document.getElementById("casticon").src = 'images/cast_icon_active.png';
	session.addUpdateListener(sessionUpdateListener.bind(this));
	if (session.media.length != 0) {
		onMediaDiscovered('onRequestSession', session.media[0]);
	}
//	session.addMediaListener(onMediaDiscovered.bind(this, 'addMediaListener'));
//	session.addUpdateListener(sessionUpdateListener.bind(this));
}

function onLaunchError() {
//	console.log("launch error");
//	appendMessage("launch error");
}

function receiverListener(e) {
	if( e === 'available' ) {
		isAvailable = true;
		$("dlna_info").innerHTML = $.lge.get("CastPlay_yes");
	}
	else {
//		console.log("receiver list empty");
//		appendMessage("receiver list empty");
		$("dlna_info").innerHTML = $.lge.get("CastPlay_no");
	}
}

function onInitSuccess() {
	console.log("init success");
}

//错误
function onError(){
	console.log.apply(console,arguments);
}

function launchApp() {
	if(isAvailable){
		chrome.cast.requestSession(function(){
			onRequestSessionSuccess.apply(this,arguments);
			loadMedia();
		}, onLaunchError);
		stopCurrentTime();
	}
}

//音量设置==========
var currentVolume;

function mediaCommandSuccessCallback(info) {
	console.log(currentVolume);
}

function setMediaVolumeShow(){
	if( !currentMedia ){
		return;
	}
	var volume = currentMedia.volume;
	$("volume_h").style.height = volume.level*140 + "px";
}


function setMediaVolume(level) {
	if( !currentMedia ){
		return;
	}

	var volume = new chrome.cast.Volume();
	volume.level = level;
	currentVolume = volume.level;
	volume.muted = false;
	var request = new chrome.cast.media.VolumeRequest();
	request.volume = volume;
	currentMedia.setVolume(request,
		mediaCommandSuccessCallback.bind(this, 'media set-volume done'),
		onError);
}

var iSlip = new Slip("volume_y","Y"),nSlipWidth;
iSlip.onStart = function(){
	nSlipWidth = $("volume_h").style.height.replace(/\D/g,"")*1 || 0;
//	alert(nSlipWidth);
};
iSlip.onMove = function(skewing){
	var x = nSlipWidth + skewing*-1;
	x = Math.max(Math.min(140,x),0);
	$("volume_h").style.height = x + "px";
	return x;
};
iSlip.onEnd = function(skewing){
	var x = iSlip.onMove(skewing);
	//设置音量
	setMediaVolume(x/140);
};

$.dom.on($("volume_c"),"vdown",function(){
	var ev = $.dom.getEvent();
	var y = ev.clientY;
	var top = $.dom.offset(this).top + 32;
	var h = Math.min(140,Math.max(0,140 - (y - top) - 10));
	$("volume_h").style.height = h + "px";
	var p = Math.min(1,h/140);
	setMediaVolume(p);
});


if(!chrome.cast || !chrome.cast.isAvailable){
	setTimeout(function(){
		var applicationID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
		var sessionRequest = new chrome.cast.SessionRequest(applicationID);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
			sessionListener,
			receiverListener);

		chrome.cast.initialize(apiConfig, onInitSuccess, onError);

		setTimeout(function(){
			if(!session){
				launchApp();
			}
		},1000);
	}, 1000);
}


//===============视觉事件===========
$('show_DlnaDevice').onclick = function(){
	launchApp();
};

$('play_status').onclick = function(){
	if(!session){
		launchApp();
		return ;
	}
	if(!currentMedia){
		loadMedia();
		return ;
	}
	if($("play_status").className == 'press'){
		pauseMedia();
	}
	else{
		playMedia();
	}
};