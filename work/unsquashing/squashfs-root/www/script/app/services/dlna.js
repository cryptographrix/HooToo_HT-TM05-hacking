/**
 * User: huhao
 * Date: 13-3-13
 * Time: 2013/3/13 11.06
 */

//单个或者多个
var isMultiple = $.config.dlnaMultipleDir;
var pathSum = 0;//当前路径个数
function toggleSwitch(flg) {		//flg 为真时 iSwitch_1 show
    var e = $("enable");
    e.className = flg ? "iSwitch_1" : "iSwitch_1-0";
    var dlnaSetting = $("dlnasetting");
    dlnaSetting.style.display = flg ? "block" : "none";
}

$.vsubmit("enable", function () {
    var e = $("enable"), f;
    if (e.className == "iSwitch_1") { f = 0; } else { f = 1; }
    toggleSwitch(f);
    $.systemPadResize();
    return false;
});

var xDLNA,iDirlist= {},xDirs;//iScan_dir
function dirSort($1,$2){
    return $1 > $2?-1:1;
}

function setDlanName(p){
    var pRoot = ["/","/"],pAarray = p.split("/");
    for (var i = 0; i < pAarray.length; i++) {
        if (i < 4) {
            pRoot[0] = (pRoot[0] == "/" ? "" : pRoot[0] + "/")  + (pAarray[i] || "");
        } else {
            pRoot[1] = (pRoot[1] == "/" ? "/" : "" + pRoot[1] + "/")  + (pAarray[i]);
        }
    }
    if(pRoot[1] == "/"){
        pRoot[1] = "";
    }
    return iDirlist[pRoot[0]] == null ? "" : iDirlist[pRoot[0]] + pRoot[1];
}

function remove_scan_li(li){
    li.parentNode.removeChild(li);
	pathSum -= 1;
	//console.log(pathSum);
	if(pathSum < 5){
		setAddBtn();
	}
}

function make_scan_li(dir){
    $.dom.create('div',{
        className:'iIpt3 iIpt3_1'
    },[
        ['div',{className:'iIpt3_l'}],
        ['div',{className:'iIpt3_rd',vclick:function(){
            remove_scan_li(this.parentNode);
        }}],
        ['div',{className:'iIpt3_cd'},['input',{type:'text',className:'ipt_v',readOnly:true,value:setDlanName(dir),v:dir}]]
    ],$('list'));
}

function setAddBtn(){
	if(isMultiple){
    $('multiple').style.display = 'block';
		if(pathSum >= 5){
			$.dom.on($("addScanDir"),"vclick",function(){
				$.msg.alert("::Service_DLNA_Dir_Error");
			});
			return false;
		}
    $.dom.electDir($("addScanDir"),function(dir,dirName){
        var arr = $.dom.get('#list input');
        for(var i=0;i<arr.length;i+=1){
            if(dirName.indexOf(arr[i].value) >= 0 || arr[i].value.indexOf(dirName) >= 0){
                remove_scan_li(arr[i].parentNode.parentNode);
            }
        }
		pathSum += 1;
		//console.log(pathSum);
		if(pathSum >= 5){
			setAddBtn();
		}
        make_scan_li(dir);
    });
	}
	else{
		$('only').style.display = 'block';
		$.dom.electDir($("electScanDir"));
	}
}
setAddBtn();


function updata(pm){
    $.msg.openLoad();
    var m = {
        action:pm.enable,
        dlna_name:pm.dlna_name,
        scan_dir:pm.scan_dir
    };
    if(isMultiple){
        m.mode = 1;
    }
    $.Ajax.post("/protocol.csp?fname=service&opt=dlna&function=set",function(){
        if(this.error){
            this.showError();
        }
        else{
            xDLNA = pm;
        }
        $.msg.closeLoad();
    },m);
}

//when click save button,execute the following code
$.vsubmit("submit", function () {
    var pm = {};
    pm.enable = $("enable").className == "iSwitch_1" ? 1 : 0;	//enable=1 表示开启
    pm.dlna_name = $("dlna_name").value.trim();
    if(isMultiple){
        var arr = $.dom.get('#list input');
        if(arr.length == 0){
            return ;
        }
        pm.scan_dir = [];
        for(var i=0;i<arr.length;i+=1){
            pm.scan_dir.push(arr[i].getAttribute('v'));
        }
        pm.scan_dir.sort(dirSort);
    }
    else{
        pm.scan_dir = $('electScanDir').v || '';
    }
    if(pm.enable == xDLNA.enable && pm.dlna_name == xDLNA.dlna_name){
        if(isMultiple){
            if(xDirs.length == pm.scan_dir.length){
                var flag;
                for(i=0;i<xDirs.length;i+=1){
                    if(xDirs[i] != pm.scan_dir[i]){
                        flag = true;
                        break;
                    }
                }
                if(!flag){
                    //完全相同
                    return false;
                }
            }
        }
        else if(xDirs[0] == pm.scan_dir){
            //完全相同
            return false;
        }
    }

    if(pm.enable == 0){
        $.msg.confirm("::Service_DLNA_Tip",function(){
            updata(pm);
        });
    }
    else{
        //check dlna device name only when dlan open
        if(/[\x00-\x2C\x2E\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]{1,32}/.test(pm.dlna_name) || pm.dlna_name == ""){
            $.msg.alert("::Service_DLNA_Name_Error",function(){
                $("dlna_name").focus();
            });
            return false;
        }
        updata(pm);
    }
    $.systemPadResize();
    return false;
});

void function(){
    $.msg.openLoad();
    $.Ajax.get("/protocol.csp?fname=security&opt=dirlist&user=" + $.data.account + "&function=get",function(){
        if(!this.error){
            $.forEach($.xjson(this.responseXML,"item"),function(l){
                if(l.limit.indexOf("w")>-1){
                    iDirlist[l.path] = l.name;
                }
            });
            $.Ajax.get("/protocol.csp?fname=service&opt=dlna&function=get",function(){
                $.msg.closeLoad();
                if(this.error == null){
                    xDLNA = $.xjson(this.responseXML,"dlna",true);
                    //xDLNA.enable = 1;		//for test 默认是开启的
                    toggleSwitch(xDLNA.enable == 1);
                    $("dlna_name").value = xDLNA.dlna_name || "";
                    xDirs = $.xjson(this.responseXML,'scan_dir');
                    if(isMultiple){
                        xDirs.sort(dirSort);
                        for(var i=0;i<xDirs.length;i+=1){
                            make_scan_li(xDirs[i]);
							pathSum += 1;
							//console.log(pathSum);
                        }
						if(pathSum >= 5){
							setAddBtn();
						}
                    }
                    else{
                        var el = $('electScanDir');
                        el.v = xDirs[0];
                        el.value = setDlanName(xDirs[0]);
                    }
                }
            });
        }else{
            $.msg.closeLoad();
            this.showError();
        }
    });
}();