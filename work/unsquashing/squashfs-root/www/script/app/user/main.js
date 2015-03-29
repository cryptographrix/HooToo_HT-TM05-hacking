var lists = [];
if($.data.account == "admin"){
	lists.push('<a class="iItem_L1" href="admin.html"><span class="iItem_L1_x">' + $.lge.get("Setting_Tit_Admin",true) + '</span></a>');
}
lists.push('<a class="iItem_L1" href="guest.html"><span class="iItem_L1_x">' + $.lge.get("Setting_Tit_Guest",true) + '</span></a>');

$("userlists").innerHTML = lists.join("");