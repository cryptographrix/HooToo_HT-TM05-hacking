/**
 * Created with JetBrains PhpStorm.
 * User: PSZ
 * Date: 2013-9-2 
 * Time: 17:26:53
 * To change this template use File | Settings | File Templates.
 */

$.vsubmit("submit", function () {
	$.Ajax.post("/protocol.csp?fname=system&opt=guide&action=1&function=set",function () {
		if(this.error) {
			this.showError();
		}else{
			$.vhref("wizard/internet.html");
		}
	});
});

//$.msg.openLoad();