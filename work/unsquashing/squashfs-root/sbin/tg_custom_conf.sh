#/bin/sh

CUSTOM_FILE="/var/run/usbdongle/custom_dial.conf"

set_3g_parameter()
{
	echo "$1=$2" >> "$CUSTOM_FILE"
}

###1.	get the dial parameter for 3g dongle
#if [ "`nvram_get 2860 ethModeAuto`" = "1" ];then
#	mode="1"
#else
#	mode="0"
#fi

user=`nvram_get 2860 wan_3g_user`
passwd=`nvram_get 2860 wan_3g_pass`
apn=`nvram_get 2860 wan_3g_apn`
#mode=`nvram_get 2860 wan_3g_dev`
dial=`nvram_get 2860 wan_3g_dial`
###2.	write parameter to custom config file

if [ "$user" != "" -a "$passwd" != "" -a "$apn" != "" -a "$dial" != "" ];then
	mode="1"
else
	mode="0"
fi

if [ -e  "$CUSTOM_FILE" ];then
	rm -f "$CUSTOM_FILE" 
fi

set_3g_parameter mode $mode
set_3g_parameter apn $apn
set_3g_parameter user $user
set_3g_parameter passwd $passwd
set_3g_parameter number $dial
