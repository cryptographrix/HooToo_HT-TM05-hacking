/**
 * Created with JetBrains PhpStorm.
 * User: poppy
 * Date: 12-12-22
 * Time: 下午5:08
 * To change this template use File | Settings | File Templates.
 */

//Wizard_Tip_close
//Wizard_Tip_ok

//验证向导中设置是否有改变
var re = $.wizard.getRe();
if(re == "1"){
	$.systemRe("Wizard_Tip_ok",121);
	$("con").style.display = "none";
	$.wizard.clear()
}