//guest是 显示用户 方便跳转
if($.data.account == "guest"){
	$("explorer_to_user").style.display = "block";
	$("admin_back").style.display = "none";
	$("b_back").style.display= "none";
}else{
	$("admin_back").style.display = "block";
	$("b_back").style.display= "block";
}
//ios 无法上传
//if(!$.isIOS){
//	$("uploadFileCot").style.display = "block";
//}

////url编码
//function encodeURL(str) {
//	return encodeURI(str).replace(/#/g, "%23").replace(/\%25([0-9a-z]{2})/g, "%$1");
//}
//url编码
function encodeURL(str){
	return encodeURI(str).replace(/#/g,"%23").replace(/[\(]/g,"%28").replace(/[\)]/g,"%29").replace(/\%25([0-9][a-z]|[a-z][0-9a-z])/g,"%$1");
}
void function (A) {
	function onCensor() {
		return true;
	}
	var host = "http://" + window.location.host;
	//var host = "http://10.10.10.254";
	//host = "http://192.168.1.11";
	A.propfind = function (url, callBack) {
		return new A(url, "PROPFIND", true).extend("onCallBack", callBack).extend("onCensor", onCensor).send(null, {
			"Content-Type": "text/xml; charset=\"utf-8\"",
			Depth: 1
		}, true);
	};
	A.mlcol = function (url, callBack) {
		return new A(url, "MKCOL", true).extend("onCallBack", callBack).extend("onCensor", onCensor).send();
	};
	A.del = function (url, callBack) {
		return new A(url, "DELETE", true).extend("onCallBack", callBack).extend("onCensor", onCensor).send();
	};
	function movecopy(type, form, to, callBack, overflow) {
		var header = {
			Destination: host + to,
			Depth: 1
		};

		if (overflow == null) {
			header.Overwrite = "F";
		}
		return new A(form, type, true).extend("onCallBack", callBack).extend("onCensor", onCensor).send(null, header);
	}
	A.move = function (form, to, callBack, overflow) {
		return movecopy("MOVE", form, to, callBack, overflow);
	};
	A.copy = function (form, to, callBack, overflow) {
		return movecopy("COPY", form, to, callBack, overflow);
	};
} ($.Ajax);
void function () {
	var iRoot = {}, iData;
	function getDirlist(fn) {
		$.msg.openLoad();
		$.Ajax.get("/protocol.csp?fname=security&opt=dirlist&user=admin&function=get", function () {
			if (this.error == null) {
				$.forEach(this.xjson("item"), function (v) {
					iRoot[v.name] = v;
					v.type = "root";
					v.path += "/";
				});
				fn.call(this);
			}
			else {
				this.showError();
			}
			$.msg.closeLoad();
		});
	}

	//根据ID获得权限
	function getLimit(lm) {
		if (!iPath) {
			return false;
		}
		var root;
		for (var n in iRoot) {
			if (iPath.indexOf(iRoot[n].path) == 0) {
				root = iRoot[n];
			}
		}
		if (!root) {
			return false;
		}
		return root.limit.indexOf(lm) > -1;
	}

	
	
	//剪切板 类型
	var clipType,hasAllOverwrite = false,OverwirteORCancel = "";
	//选中粘贴
	function pasteup(board, path, fn, overflow) {
//		$.msg.openLoad();
		var name = board.replace(/\/$/, "").split("/").pop();
		$.Ajax[clipType](board, path + name + (/\/$/.test(board) ? "/" : ""), function () {
//			$.msg.closeLoad();
			var status = this.status;
			if (status == 412) {
				var addHTML = $.lge.get("Explorer_Overwrite") + "<div class='OverwirteBig' id='overwirteAll'><div id='overwirteIcon' class='OverwirteIcon'>√</div><span class='OverwirteSpan' lge='Explorer_Continue_excute'> "+ $.lge.get('Explorer_Continue_excute') +" </span></div>";
				if(hasAllOverwrite == true){
					if(OverwirteORCancel == "overwirte"){
						pasteup(board, path, fn, true);
					}else if(OverwirteORCancel == "cancel"){
						fn(board,-1);
					}
				}else{
					$.msg.confirm(addHTML,function(){
						OverwirteORCancel = "overwirte";
						pasteup(board, path, fn, true);
					},function(){
						OverwirteORCancel = "cancel"
						fn(board,-1);
				    });
				
				   //勾选是否全部覆盖

					$.dom.on($("overwirteAll"),"vclick",function(){
						var icon = $("overwirteIcon");
						if(icon.className.indexOf("OverwirteIconActive") != -1){
							hasAllOverwrite = false;
							icon.className = "OverwirteIcon";
						}else{
							hasAllOverwrite = true;
							icon.className = "OverwirteIcon OverwirteIconActive";
						}
					});
				}
				
				return;
			}
			name = decodeURIComponent(name);
			if(name.length>15){
				name=name.substring(0,3)+"..."+name.substring(name.lastIndexOf(".")!=-1?name.lastIndexOf(".")-5:name.length-5);
			}
			fn(board,status,name);
//				if (status == 204 || status == 201) {
//					$.msg.alert("&lt;" + name + "&gt;<br />" + $.lge.get(clipType == "copy" ? "Explorer_Copy_OK" : "Explorer_Move_OK"));
//					//propfind(path.replace(/\/$/, ""));
//					propfind(path);
//				}
//				else if (status == 403) {
//					$.msg.alert("&lt;" + name + "&gt;<br />" + $.lge.get("ExpLorer_Error_Out"));
//				}
//				else {
//					$.msg.alert("&lt;" + name + "&gt;<br />" + $.lge.get(clipType == "copy" ? "ExpLorer_Error_Copy" : "ExpLorer_Error_Move"));
//				}
			//		$("NExIcons_2").style.display = "none";
		}, overflow);
	}

    function hideDown(){
        $('exe9_c').style.display = 'none';
    }
    $.dom.appendEvent($('exe9_c'),'vdown',function(){
        $.dom.getEvent().stopPropagation();
    });
	var iIcons1 = $.dom.query('#NExIcons_[4,5,7]');
	var iIcons2 = $.dom.query('#NExIcons_[6,8]');
	function setIconExeShow(){
		var downList= $.dom.get('#NExList div.MExplorer_point_down');
		if(downList.length > 0){
			iIcons1.css('display','');
			for(var i = 0; i< downList.length; i++){
				var ids = $.dom.get('#NExList div.MExplorer_point_down')[0].id.replace(/[\D]/g,"");
				if($("lnv_" + ids).className.indexOf("tp_directory") > -1){
					iIcons2[1].style.display = "none";
				}
			}
			iIcons2[0].style.display = downList.length > 1?'none':'';
		}
		else{
			iIcons1.css('display','none');
			iIcons2.css('display','none');
		}
        hideDown();
	}

	//获取选择的ids
	function getElected(name){
		return $.forEach($.dom.get('#NExList div.MExplorer_point_down'),function(v){
			var id = v.getAttribute('vid');
			if(name){
				return iData[id][name];
			}
			if(name == ''){
				return iData[id];
			}
			return id;
		},[]);
	}

	//剪切板内容
	var clipBoards,pasteNumID = 100;
    var pasteBoards;
	function clearClipBords(path){
        if(clipBoards == null){
            return ;
        }
        if(!path){
            clipBoards = null;
            $("NExIcons_2").style.display = "none";
            return ;
        }
        for(var i=0;i<clipBoards.length;i+=1){
            if(clipBoards[i] == path){
                clipBoards = null;
                $("NExIcons_2").style.display = "none";
                return ;
            }
        }
	}

    //进度
    var pastePressHandle;
    function setPastePress(id){
        var v = pasteBoards[id];
        var t = $("paste_ptxt_" + id);
        if(v && t){
            $("paste_press_" + id).style.width = t.innerHTML = Math.min(v.press,100) + "%";
        }
    }
    function getPastePress(id,flag){
        clearTimeout(pastePressHandle);
        var v = pasteBoards[id];
        if(!v.isPaste){
            return ;
        }
        var temp = v.path.split("/");
        var des = v.toPath + "" + temp[temp.length - 1];
        $.Ajax.get("/protocol.csp?fname=storage&opt=transinfo&src="+ v.path + "&des=" + des + "&function=get",function(){
            if(!this.error){
                var info = $.xjson(this.responseXML,"transinfo",true);
                var process = info.process * 1;
                if(process && process < 100){
                    v.press = Math.max(process, v.press);
                    setPastePress(id);
                }
                else if(flag){
                    v.press = 100;
                    setPastePress(id);
                    v.isEnd = true;
                    v.isPaste = false;
                    pasteStart();
                    return ;
                }
            }
            pastePressHandle = setTimeout(function(){
                getPastePress(id,flag);
            },1000);
        });
    }

    //关闭面板
    function pasteClose(){
        pasteBoards = null;
        $("paste_Mask").style.display = "none";
        propfind(iPath);
    }

    //粘贴开始
    function pasteStart(){
        var n, v,hasPaste,canStart,len = 0;
        for(n in pasteBoards){
            len += 1;
            v = pasteBoards[n];
            if(!canStart && !v.isEnd){
                canStart = v;
            }
            if(v.isPaste){
                hasPaste = true;
            }
        }
        //防止两个同时 复制粘贴
        if(hasPaste){
            return ;
        }
        if(len == 0){
            //关闭
            pasteClose();
            return ;
        }
        if(canStart){
            canStart.isPaste = true;
            pasteup(canStart.path, canStart.toPath,pasteup_back);
            //setTimeout(function(){
                getPastePress(canStart.id);
          //  },500);
            return ;
        }else{
		   //重置全部覆盖//全部取消的操作//隐藏粘贴
			hasAllOverwrite = false;
			OverwirteORCancel = "";
			if(clipType == "move"){
				$("NExIcons_2").style.display = "none";
			}
		}

        //全部复制完毕
        $('paste_btn').style.display = "block";
        $.reScrollPlate($("paste_C_c"));
    }
    //单个粘贴 进行后返回
    function pasteup_back(path,s){
        var v = pasteBoards[path];
        if(v){
            v.isEnd = true;
            v.isPaste = false;
            var id = v.id;
            var txt = $('paste_ptxt_' + id);
            if(txt){
                if(s == 403){
                    txt.innerHTML = $.lge.get("ExpLorer_Error_Out");
                }
                else if(s == 204 || s == 201){
                    v.press = 100;
                    setPastePress(v.id);
                    txt.innerHTML = $.lge.get(v.type == "copy" ? "Explorer_Copy_OK" : "Explorer_Move_OK");
                }
                else{
                    txt.innerHTML = $.lge.get(v.type == "copy" ? "ExpLorer_Error_Copy" : "ExpLorer_Error_Move");
                }
            }
        }
        //新的开始
		setTimeout(function(){
			 pasteStart();
		},1000);
       
    }

    function pasteMakeLis(toPath){
        //列出所有复制粘贴的列表
        if(toPath == null){
            toPath = iPath;
        }
        var con = $("paste_C"),pastes = {};
        $.dom.clear(con);
        pasteBoards = {};
        $.forEach(clipBoards,function(v){
            if(pastes[v] == null){
                var id = ++pasteNumID;
                pastes[v] = id;
                pasteBoards[v] = pasteBoards[id] = {
                    id:id,
                    path:v,
                    press:0,
                    type:clipType,
                    toPath:toPath,
                    isEnd:false,
                    isPaste:false
                };
                var name = decodeURIComponent(v.replace(/\/+$/,"").split("/").pop());
                $.dom.create("div",{className:"MUpload_L paste_" + clipType,id:'paste_' + id}, $.tpl.apply("mc",{
                    id:id,
                    type: name.split(".").pop() || "",
                    name: name.htmlEncode()
                }),con);
            }
        });
        $('paste_btn').style.display = "none";
        $("paste_Mask").style.display = "block";
        $.reScrollPlate($("paste_C_c"));
    }

    //取消正在粘贴
    function cancelPasteup(id){
        var v = pasteBoards[id];
        if(v){
            delete pasteBoards[v.id];
            delete pasteBoards[v.path];
            var tr = $('paste_' + id);
            tr.parentNode.removeChild(tr);
            $.reScrollPlate($("paste_C_c"));
			var paste_c = $("paste_C_c");
			var pasteMargin = parseInt(paste_c.style.marginTop);
			paste_c.style.marginTop = Math.min(0,pasteMargin + 90) + "px";
            if(v.isPaste){
				$.msg.openLoad();
					$.Ajax.get("/protocol.csp?fname=storage&opt=canceltrans&src="+ v.path + "&des=" + v.toPath + "&function=set",function(){
						$.msg.closeLoad();
						setTimeout(function(){
							pasteStart();
						},1000);	
						}());          
			}
        }
    }
    $.dom.appendEvent($("paste_btn_ok"),'vclick',function(){
	        pasteClose();
			$("paste_C_c").style.marginTop = "0";
    });

    //删除单个
    $.dom.appendEvent($('paste_C'),'vclick',function(){
        var target = $.dom.getEvent().target;
        var delId = target.getAttribute('vid_del');
        if(delId){
            cancelPasteup(delId);
        }
    });
    //删除全部
    $.dom.appendEvent($('paste_del_all'),'vclick',function(){
        var list = $.dom.get('#paste_C [vid_del]');
        var len = list.length - 1;
        for(var i=len;i>=0;i-=1){
            cancelPasteup(list[i].getAttribute('vid_del'));
        }
		$("paste_C_c").style.marginTop = "0";
		$("paste_Mask").style.display = "none";
    });

    //设置滚动条 复制粘贴的
    $.dom.setScroll($("paste_C_c"),$("paste_C_rs"));

    //获取后台正在进行复制或者剪切的数据
    $.Ajax.get("/protocol.csp?fname=system&opt=webdavcp&function=get&r=" + new Date().getTime(),function(){
        if(this.error == null){
            var item = $.xjson(this.responseXML,"webdavcp",true).item;
            if(item){
                clipType = item.option.toUpperCase()=="CP"?"copy":"move";
                clipBoards = [item.file];
                pasteMakeLis('');
                for(var n in pasteBoards){
                    break;
                }
                var v = pasteBoards[n];
                if(v){
                    v.isPaste = true;
                    setTimeout(function(){
                        getPastePress(v.id,true);
                    },500);
                }
            }
        }
    });

	//头部操作
	var topFuns = [
		//上传
		function () {
			//方法直接绑定到file表单上
		},
		//刷新
		function () {
			if (iPath) {
				propfind(iPath);
			}
			else {
				$.msg.alert("::Explorer_No_Select");
			}
		},
		//粘贴
		function () {
			if (!iPath) {
				$.msg.alert("::Explorer_No_Select");
				return;
			}
			if(!clipType){
				return ;
			}
			if(!clipBoards || clipBoards.length ==0){
				return ;
			}
			var one = clipBoards[0];
			if(one.replace(/\/+$/, "").replace(/[^\/]+$/, "") == iPath){
				return ;
			}
            pasteMakeLis();
            pasteStart();
		},
		//新建
		function () {
			if (!iPath) {
				$.msg.tip("::Explorer_No_Select");
				return;
			}
			if (!getLimit("w")) {
				$.msg.alert("::Explorer_No_Operate");
				return;
			}

			var bar = $.msg.confirm('<div class="MExplore_ipt1"><input type="text" msg_bar="nameipt" maxlength="26"></div>',function(){
				var name = bar.$nameipt.value.trim();
			if (!/^[a-zA-Z0-9\u00c0-\uFFFF\s\-_\{\}\[\]\(\)\.]+$/.test(name) || name.uniLength() > 26 || name.indexOf(".") == 0 || --name.length == name.indexOf(".") ) {
					$.msg.alert("::Setting_Folder_Directory_Tip",function(){
						bar.$nameipt.focus();
					});
					return false;
				}
				///protocol.csp?fname=security&opt=addpath&directory=/data/HardDisk1/Volume1/123&function=set
				$.msg.openLoad();
				var path = iPath + encodeURI(name) + "/";
				$.Ajax.mlcol(path, function () {
					if(this.status == 201){
						propfind(iPath);
						bar.destroy();
					}
					else{
						$.msg.alert("::ExpLorer_Error_Create",function(){
							bar.$nameipt.focus();
						});
					}
				});
				$.msg.closeLoad();
				return false;
			},null,"::Explorer_Create");
			bar.$nameipt.focus();
				$.dom.on(bar.$,"vkeyenter",function(){
				$.dom.on(bar.$okbtn,"vclick");
			});
		},
		//复制
		function () {
			clipType = "copy";
			clipBoards = getElected('path');
			$("NExIcons_2").style.display = "block";
		},
		//剪切
		function () {
			clipType = "move";
			clipBoards = getElected('path');
			$("NExIcons_2").style.display = "block";
		},
		//重命名
		function () {
			if (!getLimit("w")) {
				$.msg.alert("::Explorer_No_Operate");
				return;
			}
			var v = iData[getElected()[0]];
			if(!v){
				return ;
			}
			var oldName = decodeURIComponent(v.path.replace(/\/$/, "").split(/\//).pop());
			var bar = $.msg.confirm('<div class="MExplore_ipt1"><input type="text" value="' + oldName + '" msg_bar="nameipt" maxlength="26"></div>',function(){
				var newName = bar.$nameipt.value.trim();
				if (!/^[a-zA-Z0-9\u00c0-\uFFFF\s\-_\{\}\[\]\(\)\.]+$/.test(newName) || newName.uniLength() > 26 || newName.indexOf(".") == 0 || --newName.length == newName.indexOf(".") ) {
					$.msg.alert("::Setting_Folder_Directory_Tip");
					return false;
				}
				if (oldName == newName) {
					return;
				}
				var isDir = v.type == "httpd/unix-directory";
				if (!isDir && newName.indexOf(".") == -1 && v.path.indexOf(".") > 0) {
					newName = newName + "." + v.path.split(/[.]/).pop();
				}

				$.msg.openLoad();
				$.Ajax.move(v.path, v.path.replace(/\/$/, "").replace(/[^\/]+$/, encodeURL(newName)) + (isDir ? "/" : ""), function () {
					var status = this.status;
					if (status == 403) {
						$.msg.alert("::ExpLorer_Error_Out",function(){
							bar.$nameipt.focus();
						});
					}
					else if (status == 204 || status == 201) {
						clearClipBords(v.path);
						propfind(iPath);
						bar.destroy();
						return true;
					}
					else {
						$.msg.alert($.lge.get("Explorer_Rename_Err").replace("{#name}", oldName.htmlEncode()),function(){
							bar.$nameipt.focus();
						});
					}

				});
				$.msg.closeLoad();
				return false;
			},null,"::Explorer_Rename");
			bar.$nameipt.focus();
			$.dom.appendEvent(bar.$,"vkeyenter",function(){
				$.dom.on(bar.$okbtn,"vclick");
			});
			bar.$nameipt.focus();
		},
		//删除
		function () {
			if(!getLimit("w")) {
				$.msg.alert("::Explorer_No_Operate");
				return;
			}

			var vs = getElected('');
            var vsLen = vs.length;
			if(vsLen == 0){
				return ;
			}

			var tip = 'Explorer_Top_DeleteItem_';
			if(vsLen == 1){
				tip = vs[0].type == "httpd/unix-directory" ? "Explorer_Top_DeleteDirectory_" : "Explorer_Top_DeleteFile_";
			}

			function deleteFile(status){
				if(status && status != 204){
					$.msg.alert("::ExpLorer_Error_Del");
					$.msg.closeLoad();
					return ;
				}
				if(vs.length){
					$.Ajax.del(vs.shift().path, deleteFile);
				}
				else{
					clearClipBords();
					propfind(iPath);
					$.msg.closeLoad();
				}
			}

			$.msg.confirm($.lge.get(tip + '1').replace(/\{\#n\}/g,vsLen), function(){
				$.msg.confirm($.lge.get(tip + '2').replace(/\{\#n\}/g,vsLen), function(){
					$.msg.openLoad();
					deleteFile();
				});
			});
		},
		//下载
		function(v){
			v || (v = iData[getElected()[0]]);
			if(!v){
				return ;
			}
			if(v.type == "httpd/unix-directory"){
				for(var n in iRoot){
					if (iRoot[n].path != v.path && iRoot[n].path.indexOf(v.path) == 0) {
						setRootHtml();
						return;
					}
				}
				propfind(v.path);
			}
			else if( v.type == "root"){
				window.open("/app/main.html","_self");
			}
			else{
				window.open(v.path);
			}
		},
        //操作
        function(){
            $('exe9_c').style.display = 'block';
        },
        //全选
        function(){
            var flg,els = $.query("#NExList div[elect]");
            els.forEach(function(){
                if(this.className == "MExplorer_point"){
                    flg = true;
                    this.className = "MExplorer_point_down";
                }
            });
            if(!flg){
                els.forEach(function(){
                    this.className = "MExplorer_point";
                });
            }
            setIconExeShow();
        }
	];

	$.dom.on($("NExIcons_c"),"vclick",function(){
        var ev = $.dom.getEvent();
		var v = ev.target.getAttribute("type");
		topFuns[v] && topFuns[v]();
        ev.stopPropagation();
        if(v != 9){
            hideDown();
        }
	});
    $.dom.appendEvent(document,'vdown',function(){
        setTimeout(hideDown,10);
    });

	function appendEvent(flag) {
		var ids = [];
		for (var i = 0; i < iData.length; i += 1) {
			if (!iData[i].hide) ids.push(i);
		}
		if(flag) {
			$.query("#open_[" + ids + "]").on("vdown", function () {
				var id = this.parentNode.getAttribute("vid"), v = iData[id];
				if (v) {
					if (id == 0) {
						topFuns[8](v);
						return;
					}
					$.dom.getEvent().stopPropagation();
					this.className = this.className == 'MExplorer_point'?'MExplorer_point_down':'MExplorer_point';
					setIconExeShow();
				}
				return false;
			});
			$.query("#lnv_[" + ids + "]").on("vclick", function () {
				var v = iData[this.parentNode.getAttribute("vid")];
				v && topFuns[8](v);
				return false;
			});
			$("NExIcons").style.display = "block";
		}
		else{
			$("NExIcons").style.display = "none";
			if ($.data.account == "guest" ){
			   $("b_back").style.display = "none";
			 }
			$.query("#volum_[" + ids + "]").on("vclick", function () {
				var id = this.getAttribute("vid"), v = iData[id];
				v && propfind(v.path);
				return false;
			});
		}
	}

	//当前目录的路径
	var iPath;
	function propfind(path) {
        if(!path){
            return ;
        }
		$.msg.openLoad();
		iPath = path;
		$("b_back").style.display = "block";
		$.Ajax.propfind(path.replace(/\/+$/, ""), function () {
			iData = [];
			if (this.status < 200 || this.status >= 300) {
				$("NExList").innerHTML = "";
			}
			else {
				var types = $.xjson(this.responseXML, "D:getcontenttype"), lens = $.xjson(this.responseXML, "D:getcontentlength"), dates = $.xjson(this.responseXML, "D:getlastmodified");
				$("NExList").innerHTML = $.forEach($.xjson(this.responseXML, "D:href"), function (href, i) {
					href = href.replace(/^http:\/\/[^\/]*/, "").replace(/\/+$/, "");
					var xs = href.split(/\//);
					if (i == 0) {
						xs.pop();
						href = xs.join("/");
						if(!/^\//.test(href)){
							href = "/" + href;
						}
					}
					var name = decodeURIComponent(xs.pop());
					if (types[i] == "httpd/unix-directory") {
						href += "/";
					}
					iData[i] = {
						path: href,
						name: name,
						type: types[i]
					};
					if(name.indexOf(".") == 0){
						iData[i].hide = true;
						return "";
					}
					return $.tpl.apply("li", {
						id: i,
						filetype: types[i] == "httpd/unix-directory"?"dir":"file",
						openflag: i ? "block" : "none",
						type: i ? types[i] == "httpd/unix-directory" ? "directory" : name.split(".").pop() : "updirectory",
						name: i ? name.htmlEncode() : "..",
						attr: i ? [
							'<span class="s1">' + ((types[i] != "httpd/unix-directory" && lens[i]) ? $.sizeFormat(lens[i]) : "") + '</span>',
							'<span>' + new Date(dates[i]).format("YYYY-MM-DD hh:mm") + '</span>'
						].join("") : ""
					});
				}, []).join("");
			}
			$.systemPadResize();
			appendEvent(true);
			$.msg.closeLoad();
			//从新计算顶部 功能按键 是否显示
			setIconExeShow();
			try{
				$("open_0").remove();
			}catch(e){ 
				$("open_0").parentNode.removeChild($("open_0"));
			}
		});
	}

	function setRootHtml() {
		iData = [];
		iPath = "";
		$("NExList").innerHTML = $.forEach(iRoot, function (v) {
			iData.push(v);
			return $.tpl.apply("volume", {
				id: iData.length - 1,
				img: $.lge.get('[img_main]disk.png'), // '<img src="' + $.config.path + 'theme/' + $.config.theme + '/css/main_disk.png' + '" />',
				name: v.name.htmlEncode()
			});
		}, []).join("");
		//$("b_back").style.display = "none";
		appendEvent();
	}
	$.dom.on($("b_back"), "vclick", function(){
		topFuns[8](iData[0]);
		return false;
	});
	getDirlist(setRootHtml);

	//上传
	//检测本机是否安装flash控件
	function checkFlashObject(){
		if(navigator.plugins && navigator.mimeTypes.length){
			var x = navigator.plugins["Shockwave Flash"];
			if(x){
				return true;
			}
		}
		else{ /// Win IE (non mobile)
			var axo;
			try{
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			}catch(e){
				try{
					axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
				}catch(e){}
				try{
					axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				}catch(e){}
			}
			if(axo != null){
				return true;
			}
		}
		return false;
	}
	var isFlashUp = checkFlashObject();

	//2G
	var iUploadMaxSize = 2147483648, iUpData, iUpAjax, iUpFresh;
	function onFileUpPrgress(event) {
		if (event.lengthComputable) {
			var id = this.iUpId, tr = $("upload_ptxt_" + this.iUpId);
			if (tr) {
				$("upload_press_" + id).style.width = $("upload_ptxt_" + id).innerHTML = Math.floor(event.loaded * 100 / event.total) + "%";
			}
		}
	}
	function onFileUpEnd() {
		var tr = $("upload_ptxt_" + this.iUpId);
		if(tr){
			if(this.status == 413) {
				$("upload_ptxt_" + this.iUpId).innerHTML = $.lge.get("ExpLorer_Error_Out").replace('“{#name}”', "").replace('"{#name}"', "");
			}
			else {
				var str = this.responseText.toLowerCase(), key;
				if(str.indexOf('",0)') > 0) {//'uploadcomplete("' + key +
					//成功
					key = null;
					iUpFresh = true;
				}
				else if(str.indexOf('",1)') > 0) {
					//失败 1
					key = 1;
				}
				else if(str.indexOf('",2)') > 0) {
					//失败 has
					key = "2";
				}
				else if(str.indexOf('",3)') > 0) {
					//失败 same
					key = "3";
				}
				else if(str.indexOf('",4)') > 0) {
					//失败 same
					key = "4";
				}
				else if(str.indexOf('",5)') > 0) {
					//失败 same
					key = "5";
				}
				else {
					key = "Time";
				}
				$("upload_ptxt_" + this.iUpId).innerHTML = $.lge.get(key ? "ExpLorer_Upload_Error_" + key : "Explorer_Upload_Success").replace('“{#name}”', "").replace('"{#name}"', "");
			}
		}
		nextUpload();
	}


	function checksave(name){	//name 为上传文件的名字 type 为"0"
		var x = $.query("#NExList [filetype=file]");
		for(var i = x.length-1;i >= 0;i -= 1){
			if(x[i].innerHTML == name){
				return true;
			}	
		}
			return false;
		
	};

	function up(iUpAjax,curr){
			//上传前，先检测服务器状况
		//上传前先检测是否有足够的空间
		var dir = iPath.replace(/\/+$/,"");
		$.Ajax.post("/protocol.csp?fname=storage&opt=dirfreesize&function=get&dir=" + dir ,function(){
			//flg = 1;
			if(this.error == null){
				var size = parseInt($.xjson(this.responseXML,"dirfreesize",true).size);
				//size = 5;
				if(!isNaN(size) && size < iUpData[curr].size){
					$("upload_ptxt_" + curr).innerHTML = $.lge.get("ExpLorer_Upload_Error_1").replace('“{#name}”', "").replace('"{#name}"', "");
					nextUpload();
					return ;
				}
			}

			var url = '/upload.csp?uploadpath=' +dir + "&file=file" + new Date().getTime() + "&session=" + (new RegExp("[?:; ]*SESSID=([^;]*);?").test(document.cookie) ? RegExp["$1"] : "");
			if(isFlashUp){
				(document["ExiDwSWF"] || $$("ExiDwSWF")).submit(curr,url);
			}
			else{
				var fp = new FormData();
				fp.append("file1", iUpData[curr]);
				iUpAjax = new $.Ajax(url, "POST");
				iUpAjax.onProgress = onFileUpPrgress;
				iUpAjax.onCallBack = onFileUpEnd;
				$("upload_ptxt_" + curr).innerHTML = "1%";
				iUpAjax.iUpId = curr;
				iUpAjax.send(fp);
			}
		});
	};
	
	function nextUpload() {
		if(iUpAjax == null){
			iUpAjax = {iUpId:-1};

		}
		var curr = iUpAjax.iUpId+=1;
		if(curr >= iUpData.length) {
			//全部结束
			if ($("MUpload_C").innerHTML.trim()) {
				$("MUpload_btn").style.display = "block";
				var c = $("MUpload_C_c");
				c.style.marginTop = c.parentNode.offsetHeight - c.offsetHeight + "px";
				hasAllOverwrite = false;
			    OverwirteORCancel = "";
				$.reScrollPlate(c);
			}
			else {
				uploadHidden();
			}
		}
		else if(!$("upload_ptxt_" + curr)){
			nextUpload();
		}
		else if (iUploadMaxSize < iUpData[curr].size) {
			$("upload_ptxt_" + curr).innerHTML = $.lge.get("ExpLorer_Upload_Error_").replace('“{#name}”', "").replace('"{#name}"', "");
		//	iUpAjax.iUpId = curr;
			nextUpload();
		}
		else {
			if (checksave(iUpData[curr].name)){
			    var addHTML = $.lge.get("Explorer_Overwrite") + "<div class='OverwirteBig' id='overwirteAll'><div id='overwirteIcon' class='OverwirteIcon'>√</div><span class='OverwirteSpan' lge='Explorer_Continue_excute'> "+ $.lge.get('Explorer_Continue_excute') +" </span></div>";
				if(hasAllOverwrite == true){
				    if(OverwirteORCancel == "overwirte"){
						up(iUpAjax,curr);
					}else if(OverwirteORCancel == "cancel"){
						$("upload_ptxt_" + curr).innerHTML = $.lge.get("ExpLorer_Upload_Error_cannel");
							 setTimeout(function(){
							   OverwirteORCancel = "cancel";
								nextUpload();
							},250);
						
					}
				   
				}else{
					$.msg.confirm(addHTML,
						 function(){
						   OverwirteORCancel = "overwirte";
							up(iUpAjax,curr);
						 },		//点击确认覆盖后执行的函数
						function(){
							$("upload_ptxt_" + curr).innerHTML = $.lge.get("ExpLorer_Upload_Error_cannel");
							 setTimeout(function(){
							   OverwirteORCancel = "cancel";
								nextUpload();
							},250);
						}								//点击取消后执行的函数
					  );
					  
					 //勾选是否全部覆盖
					$.dom.on($("overwirteAll"),"vclick",function(){
						var icon = $("overwirteIcon");
						if(icon.className.indexOf("OverwirteIconActive") != -1){
							hasAllOverwrite = false;
							icon.className = "OverwirteIcon";
						}else{
						   hasAllOverwrite = true;
						   icon.className = "OverwirteIcon OverwirteIconActive";
						}
					}); 
						
				}
				/*$.msg.confirm("::Explorer_Overwrite",
					function(){
						up(iUpAjax,curr);
					},		//点击确认覆盖后执行的函数
					function(){
					//	$("upload_"+curr).style.display="none";
					//	if(curr == iUpData.length-1){uploadHidden();}
						$("upload_ptxt_" + curr).innerHTML = $.lge.get("ExpLorer_Upload_Error_cannel");
						setTimeout(function(){
							nextUpload();
						},250);
					}								//点击取消后执行的函数
				);*/
			
			}else{
			up(iUpAjax,curr);
			}			
		}
	}
	function fileDelete() {
		var id = this.getAttribute("vid");
		//删除当前节点
		this.parentNode.parentNode.removeChild(this.parentNode);
		$.reScrollPlate($("MUpload_C_c"));
		var upload_c = $("MUpload_C_c");
			var uploadMargin = parseInt(upload_c.style.marginTop);
			upload_c.style.marginTop = Math.min(0,uploadMargin + 90) + "px";
		//如果正在上次，转入下一个上传
		if(iUpAjax && iUpAjax.iUpId == id) {
			iUpAjax.onProgress = iUpAjax.onCallBack = null;
			if(isFlashUp){
				(document["ExiDwSWF"] || $$("ExiDwSWF")).cancel();
			}
			else{
				iUpAjax.abort();
			}
			nextUpload();
		}
		else if ($("MUpload_C").innerHTML.trim() == "") {
			uploadHidden();
		}
		return false;
	}

    //全部删除
    $.dom.appendEvent($('MUpload_del_all'),'vclick',function(){
        var list = $.dom.get('#MUpload_C [vid]');
        var len = list.length - 1;
        for(var i=len;i>=0;i-=1){
            fileDelete.call(list[i]);
        }
		$("MUpload_C_c").style.marginTop = "0";
		$("MUpload_Mask").style.display = "none";
    });
    
	function fileUploadChange() {
		if(this.files.length){
			var ids = [],str = $.forEach(iUpData = this.files, function (file, id) {
				//if(file.size){
					ids.push(id);
					return $.tpl.apply("upload", {
						id: id,
						type: file.name.split(".").pop(),
						name: file.name.htmlEncode()
					});
				//}
				return "";
			}, []).join("");
			if(str){
				$("MUpload_C").innerHTML = str;
				$("MUpload_Mask").style.display = "block";
				$("MUpload_Mask").style.height = $.dom.getMaxHeight() + 30 + "px";
				$.reScrollPlate($("MUpload_C_c"));
				//加入删除按钮事件
				$.query("#upload_del_[" + ids.join(",") + "]").on("vclick", fileDelete);

				//开始上传
				iUpAjax = null;
				iUpFresh = null;
				nextUpload();
			}
		}
	}

	function fillFileInput() {
		var c = $("uploadFileCot");
		if($.isMobile && window.FormData){
			c.innerHTML = '<input type="file" multiple id="uploadFile" title="' + $.lge.get("Explorer_Upload") +'"/>';
			$('uploadFile').onchange = fileUploadChange;
		}
		else if(isFlashUp){
			if(c.innerHTML.trim() == ""){
				c.innerHTML = [
					'<object width="30" height="32" id="ExiDwSWF" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10">',
					'<param value="../../script/app/explorer/uploadnas.swf" name="movie">',
					'<param value="high" name="quality">',
					'<param value="transparent" name="wmode">',
					'<param name="allowFullscreen" value="false">',
					'<param name="allowScriptAccess" value="always">',
					'<embed name="ExiDwSWF" src="../../script/app/explorer/uploadnas.swf" width="30" height="30" allowscriptaccess="always" allowfullscreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" wmode="transparent">',
					'</object>'
				].join("");
			}
		}
		else if(window.FormData){
			c.innerHTML = '<input type="file" multiple id="uploadFile" title="' + $.lge.get("Explorer_Upload") +'"/>';
			$('uploadFile').onchange = fileUploadChange;
		}
	}
	window.flashUp = {
		addSelect:function(list){
			fileUploadChange.call({files:list});
		},
		complete:function(data){
			iUpAjax.responseText = data || "";
			onFileUpEnd.call(iUpAjax);
		},
		progress:function(per){
			var id = iUpAjax.iUpId, tr = $("upload_ptxt_" + id);
			if(tr){
				if(!isNaN(per)){
					$("upload_press_" + id).style.width = $("upload_ptxt_" + id).innerHTML = per + "%";
				}else{
					$("upload_press_" + id).style.width = $("upload_ptxt_" + id).innerHTML = 100 + "%";
				}
			
			}
		}
	};

	//上传框确定按钮事件
	function uploadHidden() {
		$("MUpload_Mask").style.display = $("MUpload_btn").style.display = "none";
		fillFileInput();
		iUpFresh && propfind(iPath);
		$("MUpload_C_c").style.marginTop = "0";
		return false;
	}
	$.dom.on($("MUpload_btn_ok"), "vclick", uploadHidden);
	uploadHidden();
	if(!$.isIOS){
		if(isFlashUp || window.FormData){
			$("uploadFileCot").style.display = "block";
		}
		else{
			$.msg.alert("::Explorer_Upload_flash_no");
		}
	}
	//设置滚动条
	$.dom.setScroll($("MUpload_C_c"),$("MUpload_C_rs"));
} ();