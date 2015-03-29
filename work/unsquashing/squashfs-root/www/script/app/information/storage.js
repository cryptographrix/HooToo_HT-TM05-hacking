/**
 * Created with JetBrains PhpStorm.
 * User: poppy
 * Date: 12-12-16
 * Time: 下午2:06
 * To change this template use File | Settings | File Templates.
 */

//所有磁盘信息,已经挂载的磁盘
var iDisks;//,iDisk_list = [];
	//$.Ajax.get("/protocol.csp?fname=storage&opt=listen_disk&function=get&t=" + new Date().getTime(),function(){
	//	if(!this.error){
	//		iDisk_list = $.xjson(this.responseXML,"item");
	//		if(iDisk_list.length != 0){
	//			getDisk();
	//		}
	//	}
	//	return ;		
	//});
//获取分区使用信息
function getVolume(){
	if(iDisks.length==0){
		$.msg.closeLoad();
		return ;
	}
	var m = iDisks.shift();//,idisk_l = iDisk_list;
	//var isMount = 0;
	//for(var i = 0; i < idisk_l.length;i++){
		//当前磁盘 已经挂载
	//	if(idisk_l[i].name == m.name){
	//		isMount = 1;
	//	}
	//}
	//if(isMount == 0){
	//	$("diskInfo_" + m.id).style.display = "none";
	//	var lastLine = $.query("#storageCon > .MStorage_S").pop();
	//	lastLine.style.display = "none";
	//	$.msg.closeLoad();
	//	return ;
	//}
	$.Ajax.get("/protocol.csp?fname=storage&opt=partopt&diskname="+m.name+"&function=get",function(){
				if(this.error == null){
					var free = 0,dsize = $.xjson(this.responseXML,"partopt",true).dsize || 0;
					$("diskcap" + m.id).innerHTML = $.sizeFormat(dsize);
					$.forEach($.xjson(this.responseXML,"partition"),function(p){
						free += (parseFloat(p.free) || 0);
					});
					$("disk" + m.id).innerHTML = $.lge.get("IM_Storage_available") + '<br />' + $.sizeFormat(free);
					var p = Math.min(100,Math.max(0,Math.round((dsize - free)*100/dsize)));
					$("perTxt" + m.id).innerHTML = p + '%';
					$("perImg" + m.id).innerHTML = $.lge.get("[img_storage]" + Math.ceil(p/5) + ".png");
					var nick = m.nicky1 || m.nicky;
						$.dom.on($("remove_" + m.id),"vclick",function(){
							$.msg.confirm($.lge.get("Setting_Disk_Is_remove").replace("{#name}", "\t" + nick),function(){
								Remove(m);
							});
						});
						
						if((!$.config.hasPlug || nick.toLowerCase() == "usbdisk1") && $.config.hasInlayDisk){
					//	if(((!$.config.hasPlug || nick.toLowerCase() == "usbdisk1") && $.config.hasInlayDisk) || isMount != 1){
							$("remove_" + m.id).style.display = "none";
						}else{
							$("remove_" + m.id).style.display = "block";
						}
				}
				getVolume();
			});
}

function fillStorageCon(items){
	iDisks = [];
	$("storageCon").innerHTML = $.forEach(items,function(m){
	//	var idisk_l = iDisk_list,isMount = 0;
		//for(var i = 0; i < idisk_l.length;i++){
			//当前磁盘 已经挂载
		//	if(idisk_l[i].name == m.name){
		//		isMount = 1;
		//	}
	//	}
		if(m.mount == 0){
			return;
		}
		//console.log(isMount)
		iDisks.push(m);
		return $.tpl.apply("li",{
			nicky:m.nicky1 || m.nicky,
			id:m.id,
			vendor:m.vendor,
			firmware:m.firmware,
			serial:m.serial,
			defImg: $.lge.get("[img_storage]" + "0.png"),
			removeLge: $.lge.get("Setting_Folder_Remove")
		});
	},[]).join('<div class="MStorage_S"></div>');
	$.systemPadResize();
}

//获取磁盘
//function getDisk(){
	$.msg.openLoad();
	$.Ajax.get("/protocol.csp?fname=storage&opt=disk&function=get",function(){
		if(this.error == null){
			fillStorageCon($.xjson(this.responseXML,"item"));
			getVolume();
		}
		else{
			this.showError();
			$.msg.closeLoad();
		}
	});
//}
//移除磁盘
function Remove(sd){
	$.msg.openLoad();
	$.Ajax.post("/protocol.csp?fname=storage&opt=usbremove&function=set",function(){
		$.msg.closeLoad();
		if(this.error){
			this.showError();
		}else{
			var nick = sd.nicky1 || sd.nicky;
			$.msg.alert($.lge.get("Setting_Disk_NoMount").replace("{#name}","\t" + nick),function(){
				window.location.reload();
			});
			return true;
		}
		return false;
	},{
	   name : sd.name
	  }
	);
 }