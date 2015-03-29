//默认进入的磁盘
var VolumePath = 'UsbDisk';
//定向回来
var loca;
void function(s){
	loca = s == "loca=def" ? true : false;
}(document.location.hash.replace(/^#+/,"").trim());
//获取文件是否存在
// /data/UsbDisk1/
	var pathName = window.location.pathname, host = "http://" + window.location.host + "/",i = 1;
	function getFile(){
		if(i>=10){
			window.location.href = host + "index.html";
			return false;
		}
	    $.Ajax.get('/data/'+ (VolumePath + i) + '/Volume1/app/app.html',function(){
			if(pathName == "/" && !loca){
				if(this.status == 200){
					window.location.href = host + "app"+ i +".html";
					return false;
				}else{
					i = ++i;
					getFile();	
				}
					
				}
		});
	};
	getFile();
		

	
