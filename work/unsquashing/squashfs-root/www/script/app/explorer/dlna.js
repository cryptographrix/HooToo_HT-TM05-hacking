//var Slip = function(){
//	var Doc = document,
//		M	= PUI.dom;
//
//	function slipDown(self){
//		if(self.isMoveing){
//			return ;
//		}
//		var ev = M.getEvent();
//		self.isMoveing = true;
//
//		if(window.captureEvents){
//			window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
//		}
//		else if(self.dom.setCapture){
//			self.dom.setCapture();
//		}
//		var cur = ev["client" + self.aspect];
//		M.bind(Doc,"vmove",slipMove,self,cur);
//		M.bind(Doc,"vup",slipUp,self,cur);
//
//		self.fireEvent("start");
//	}
//
//	function slipMove(self,cur){
//		window.getSelection ? window.getSelection().removeAllRanges() : Doc.selection.empty();
//		var end = M.getEvent()["client" + self.aspect] - cur;
//		self.fireEvent("move",end);
//	}
//
//	function slipUp(self,cur){
//		if(!self.isMoveing){
//			return;
//		}
//		//var ev = M.getEvent();
//		if(window.releaseEvents){
//			window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
//		}
//		else if(self.dom.releaseCapture){
//			self.dom.releaseCapture();
//		}
//		//var cur = ev["client" + self.aspect] - cur;
//		//self.cur = Math.min(Math.max(0,cur),self.len);
//
//		M.unbind(Doc, "vup", slipUp);
//		M.unbind(Doc, "vmove", slipMove);
//		self.isMoveing = null;
//
//		var end = M.getEvent()["client" + self.aspect] - cur;
//		self.fireEvent("end",end);
//	}
//
//	return PUI.lib.extend(PUI.lib.Event,function(id,aspect){
//		this.dom = M.getId(id);
////		this.len = len || 100;
//		this.aspect = aspect || "X";
////		this.cur = 0;
//		M.bind(this.dom,"vdown",slipDown,this);
//	});
//}();

function showarrows(){
//如果是pad的UI，则屏蔽dlna显示的左右箭头
//	if ( $.isMobile ){
	//	$("imgview_left").style.display = "none";
	//	$("imgview_right").style.display = "none";
	//}else{
	///	$("imgview_left").style.display = "block";
	//	$("imgview_right").style.display = "block";
//}
}
$.Ajax.get("/dlna.csp?fname=dlna&opt=get_item_num&function=get",function(){
	if(!this.error){
		$("count_videos").innerHTML = "  (" + $.xjson(this.responseXML,"video",true) + ")";
		$("count_photos").innerHTML = "  (" + $.xjson(this.responseXML,"photos",true) + ")";
		$("count_music").innerHTML = "  (" + $.xjson(this.responseXML,"music",true) + ")";
		$("count_documents").innerHTML = "  (" + $.xjson(this.responseXML,"document",true) + ")";

	}
});
function thumbnail(type){
	this.type = type;
	this.unviews = [];
}
thumbnail.prototype.setData = function(domId,src){
	this.unviews.push([domId,src]);
	return this;
};
thumbnail.prototype.start = function(){
	if(this.loadImg || this.unviews.length == 0){
		return this;
	}
	var me = this,img = this.loadImg = new Image();
	img.onload = function(){
		$(me.unviews[0][0]).appendChild(img);
		try{
			$(me.unviews[0][0] + "_bg").style.backgroundImage = "none";
		}catch(e){}
		img.onerror();
	};
	img.onerror = function(){
		me.unviews.shift();
		img.onload = img.onerror = null;
		img = me.loadImg = null;
		setTimeout(function(){
			me.start();
		},0);
	};
	img.src = this.unviews[0][1];
	//alert(img.src);
};

thumbnail.prototype["break"] = function(){
	if(this.loadImg){
		this.loadImg.onload = this.loadImg.onerror = null;
		this.loadImg = null;
	}
};

var kThumbnail = {
	videos:new thumbnail("videos"),
	photos:new thumbnail("photos"),
	music:new thumbnail("music"),
	documents:new thumbnail("documents")
};

var hasChromeCast = $.config.hasChromecast && $.isChrome && !$.isMobile;

//设置头部 以及那个点亮
var iLi = $.dom.query("#li_[videos,photos,music,documents]").on("click",function(){
	if(iLi[iView]){
		kThumbnail[iView]["break"]();
		iLi[iView].className = "ico";
		$("con_" + iView).style.display = "none";
	}
	iView = this.id.replace(/^li_/,"");
	iLi[iView].className = "ico view";
	$("con_" + iView).style.display = "block";
	$("title").innerHTML = $.lge.get("Metro_" + iView);

	kList[iView + "Init"]();
}).$,iView;

var imgMaxSize = 2*1024*1024,kScroll = {},liLength = 100,kIds = {};
function getData(view,start){
	start || (start = 0);
	if(kScroll[view + "Flag"] || !kIds[view] || (kScroll[view + "Max"] && start >= kScroll[view + "Max"])){
		return ;
	}
	kScroll[view + "Flag"] = true;
	$.Ajax.get("/dlna.csp?fname=dlna&opt=GetBrower&ObjectID=" + kIds[view] + "&Filter=*&BrowseFlag=BrowseDirectChildren&SortCriteria=&RequestedCount=" + liLength + "&StartingIndex=" + start + "&function=get",function(){
//			this.error = null;
//			this.responseXML = PUI.data.parseXML([
//				'<root><dlna><GetBrower>',
//				'<item><id>1$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/607386082.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>2$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/IMG_3105.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>3$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/4848958726_41de072b76.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>4$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/4848967572_df118dcb8a.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>5$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/4848976682_be913aa56e.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>6$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/4848977400_a1018a4869.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>7$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/IMG_3204.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>8$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/IMG_3137.jpg</path><date></date><size>137780</size></item>',
//				'<item><id>9$42</id><dtd>file</dtd><title></title><path>/data/UsbDisk1/Volume1/test/IMG_3147.jpg</path><date></date><size>137780</size></item>',
//				'<NumberReturned>3</NumberReturned><TotalMatches>2000</TotalMatches><errorno>0</errorno></GetBrower></dlna></root>'
//			].join(""));
		if(this.error){
			kScroll[view + "Flag"] = null;
			this.showError();
			return ;
		}
		var max = kScroll[view + "Max"] = $.xjson(this.responseXML,"TotalMatches",true);
		$("count_" + view).innerHTML = "  (" + max + ")";
		var nums = [],thumb = kThumbnail[view],con = $("con_" + view);
		var hasTui = view == "videos" && ($.config.hasDlnaPlay || hasChromeCast) && true;
		$.forEach($.xjson(this.responseXML,"item"),function(v,i){
			//alert(v.date.replace(/-/g,"/"));
			if(view == "videos" && i > max){
				return false;
			}
			var href = unescape(decodeURI(v.path)), name = href.split(/\/+/).pop();
			i = i + start + 1;
			nums.push(i);
			con.appendChild($.dom.create("div",null,$.tpl.apply("li", {
				imgview:function(){
					if(v.thumpath){
						var r = decodeURI(v.thumpath);
						var id = 'iThumbnail_' + view + '_' + i;
						thumb.setData(id,r);
						return '<div class="MExplorer_lix_view" id="' + id + '"></div>'
					}
					return '';
				}(),
				playview : function(){
					if(hasTui){
						var hs = [
							'<div class="MExplorer_tui" id="tui_videos_' + i + '"></div>',
							'<div class="MExplorer_tui_c" id="tui_videos_' + i + '_c"><div class="MExplorer_tui_cc">',
							'<div class="MExplorer_tui_point"></div>',
							null,
							'</div></div>'];
						var x = [];
						if($.config.hasDlnaPlay){
							x.push('<div class="MExplorer_tui_dlna" id="dlna_videos_' + i + '">DLNA</div>');
						}
						if(hasChromeCast){
							x.push('<div class="MExplorer_tui_cast" id="cast_videos_' + i + '">Chrome cast</div>');
						}
						hs[3] = x.join('<div class="MExplorer_tui_line"></div>');
						return hs.join('');
					}
					return '';
				}(),
				i:view + "_" + i,
				type: name.split(".").pop().toLowerCase(),
				name: name.htmlEncode(),/*下面%的替换一定要在最前，否则后面替换全部失效*/
				href: href.htmlEncode().replace(/\%/g,"%25").replace(/\#/g,"%23").replace(/\'/g, "%27"),
				attr: [
						'<span class="s1">' + $.sizeFormat(v.size) + '</span>',
						'<span>' + v.date.replace(/T/," ").replace(/:\d{1,2}$/,"") + '</span>'
				].join("")
			})).firstChild);
		});
		thumb.start();
		if(view == "photos"){
			if(PUI.lib.IE != 6){
				setImgs(nums);
			}
		}
		else if(hasTui){
			setVideos(nums);
		}
		kScroll[view + "Flag"] = null;
		kScroll[view + "Start"] = start + liLength;
	});
}

function setVideos(x){
	var tuiSee;
	function hideTuiSee(){
		var t = $(tuiSee);
		if(t){
			t.style.display = 'none';
		}
		tuiSee = '';
	}
	$.dom.appendEvent(document,'vclick',hideTuiSee);
	$.query("#tui_videos_[" + x.join(",") + "]").on("vclick",function(){
		var ev = $.dom.getEvent();
		ev.stopPropagation();
		ev.preventDefault();
		hideTuiSee();
		tuiSee = this.id + '_c';
		$(tuiSee).style.display = 'block';
	});
	if($.config.hasDlnaPlay){
		$.query("#dlna_videos_[" + x.join(",") + "]").on("vclick",function(){
			var ev = $.dom.getEvent();
			ev.stopPropagation();
			ev.preventDefault();
			var href = this.parentNode.parentNode.parentNode.getAttribute("href");
			document.cookie = 'play=' + encodeURIComponent(href);
			$.vhref("explorer/dlna_play.html");
			hideTuiSee();
			return false;
		});
	}
	if(hasChromeCast){
		$.query("#cast_videos_[" + x.join(",") + "]").on("vclick",function(){
			var ev = $.dom.getEvent();
			ev.stopPropagation();
			ev.preventDefault();
			var href = this.parentNode.parentNode.parentNode.getAttribute("href");
			document.cookie = 'play=' + encodeURIComponent(href);
			$.vhref("explorer/cast_play.html");
			hideTuiSee();
			return false;
		});
	}
}

//滚动分页
window.onscroll = window.onresize = function(){
	var max = document.documentElement.scrollHeight - 100 ,h = (document.body.scrollTop || document.documentElement.scrollTop) + document.documentElement.clientHeight;
	if(h > max){
		getData(iView,kScroll[iView + "Start"]);
	}
};

window.kList = {
	videosInit : function(){
		kIds.videos = 2;
		getData("videos");
		this.videosInit = function(){
			kThumbnail.videos.start();
		};
	},
	photosInit : function(){
		kIds.photos = 3;
		getData("photos");
		this.photosInit = function(){
			kThumbnail.photos.start();
		};
	},
	musicInit : function(){
		kIds.music = 1;
		getData("music");
		this.musicInit = function(){
			kThumbnail.music.start();
		};
	},
	documentsInit : function(){
		kIds["documents"] = 4;
		getData("documents");
		this.documentsInit = function(){
			kThumbnail.documents.start();
		};
	}
};


//图片查看
function imgCalculate(){
	this.w = this.scrollWidth;
	this.h = this.scrollHeight;
	_imgCalculate();
	$("imgview_img").className = "";
	this.style.visibility = "visible";
	return false;
}
function _imgCalculate(){
	var cot = $("imgview_img"),img = cot.firstChild;
	if(img && img.w && img.h){
		var cot = $("imgview_cot"),mw = $.dom.width(cot),mh = $.dom.height(cot);
		var w = img.w, h = img.h,xw = w / mw, xh = h / mh;
		var con = $("imgview_con"),sw,sh;
		if(xw > 1 || xh > 1){
			var s = 1 / (xh > xw ? xh : xw), sw = parseInt(w * s), sh = parseInt(h * s);
			img.style.width = con.style.width = sw + "px";
			img.style.height = con.style.height = sh + "px";
		}
		else {
			con.style.width = w + "px";
			con.style.height = h + "px";
			sw = w;
			sh = h;
		}
		con.style.marginLeft = sw < mw?parseInt((mw - sw) / 2) + "px":"0";
		con.style.paddingTop = sh < mh?parseInt((mh - sh) / 2) + "px":"0";
	}
}
$.dom.appendEvent(window,"resize",_imgCalculate);
var iMax,iN;
function setImgs(x){
	$.query("#lix_photos_[" + x.join(",") + "]").on("vclick",function(){
		iN = this.id.replace("lix_photos_","");
		$("imgview").style.display = "block";
		imgView();
		return false;
	});
	iMax = x.pop();
}
function imgView(){
	$("imgview_img").className = "MPhotoView_NLoading";
	var d = $("lix_photos_" + iN);
	if(d){
		var img = new Image(),cot = $("imgview_img");
		img.onload = imgCalculate;
		cot.innerHTML = '';
		cot.appendChild(img);
		img.style.visibility="hidden";
		img.src = d.getAttribute("href");
		//$.dom.opacity(img,0);
		//$("imgview_img").innerHTML = '<img onload="$.imgCalculate(' + w + ',' + h + ',this);" src="' + d.getAttribute("href") + '" />';
	}
}
$.dom.on($("imgview_left"),"vclick",function(){
	$("imgview_close").style.display="none";
	iN = parseInt(iN)-1;
	if(iN < 1){
		iN = iMax;
	}
	imgView();
	$.dom.getEvent().stopPropagation();
	$("imgview_close").style.display="block";
	return false;
});
$.dom.on($("imgview_right"),"vclick",function(){
	$("imgview_close").style.display="none";
	iN = parseInt(iN)+ 1;
	if(iN > iMax){
		iN = 1;
	}
	imgView();
	$.dom.getEvent().stopPropagation();
	$("imgview_close").style.display="block";
	return false;
});

$.dom.on($("imgview_img"),"vclick",function(){

	if ( $.isMobile){
		$("imgview_close").style.display = "block";
	}
	return false;
});

$.dom.on($("imgview_close"),"vclick",function(){
	$("imgview").style.display = "none";
	$("imgview_img").innerHTML = "";
	return false;
});
var iClientX;
$.dom.on($("imgview_cot"),"vdown",function(){
	var ev = $.dom.getEvent();
	iClientX = ev.clientX;
	ev.stopPropagation();
});
$.dom.appendEvent($("imgview_cot"),"vmove",function(){
	$.dom.getEvent().preventDefault();
	window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
});
$.dom.on($("imgview_cot"),"vup",function(){
	if(iClientX){
		var x =  iClientX - $.dom.getEvent().clientX;
		if(Math.abs(x)>20){
			$.dom.on($("imgview_" + (x>0?"left":"right")),"vclick");
		}
		iClientX = null;
	}
});
$.dom.on($("imgview_cot"),"vclick",function(){
	$.dom.toggleClass(this,"MPhotoViewHide");
	return false;
});
if(!$.isMobile){
	$.dom.removeClass($("imgview_cot"),"MPhotoViewHide");
}
//vkeyenter: 13,
//	vkeybackspace: 8,
//	vkeyspace: 32,
//	vkeydel: 46,
//	vkeyleft: 37,
//	vkeyup: 38,
//	vkeyright: 39,
//	vkeydown: 40,
//	vkeyesc:27

$.dom.appendEvent(document,"vkeyesc",function(){
	if($("imgview").style.display != "none"){
		$("imgview").style.display = "none";
	}
});
$.dom.appendEvent(document,"vkeyleft",function(){
	if($("imgview").style.display != "none"){
		$.dom.on($("imgview_left"),"vclick");
	}
});
$.dom.appendEvent(document,"vkeyright",function(){
	if($("imgview").style.display != "none"){
		$.dom.on($("imgview_right"),"vclick");
	}
});

void function(x){
	x = iLi[x]?x:"videos";
	$.dom.on(iLi[x],"click");
}(document.location.hash.replace(/^#+/,""));