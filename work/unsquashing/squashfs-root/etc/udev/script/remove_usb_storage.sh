#!/bin/sh
#start LED
#function
if [ -f /etc/f_dir/wifidg_led -a $internet -eq 0 ]; then
        touch /var/lock/wifidg
        /usr/sbin/pioctl internet 1
fi

check_dev_flag(){
	type=`ls /tmp/sd?_type`
	#add by zhangwie 20131106 compatible with Toshiba SD
	if [ "$type" == "" ]; then
		type=`ls /tmp/mmcblk?_type`
	fi
	echo "$type" > /tmp/sdx_type
	while read stype; do
		echo stype=$stype
		dev=`echo $stype | cut -d"_" -f1`
		if [ ! -e "$dev"_plugflag ]; then
			rm -rf "$stype"
		fi
	done < /tmp/sdx_type
	rm -fr /tmp/sdx_type
}

#swapoff_switch=`cat /proc/swapoff_switch`
#if [ $swapoff_switch -eq 1 ]; then
#        echo swapoff_switch=$swapoff_switch
#        killall -kill telnetd
#	telnetd &
#        exit 0
#fi
#protype=`cat /etc/firmware | grep PRODUCTLINE | cut -d "=" -f2`
internet=`cat /proc/vsintled`
#if [ $protype == "WiFiDG" -a $internet -eq 0 ]; then
if [ -f /etc/f_dir/wifidg_led -a $internet -eq 0 ]; then
        touch /var/lock/wifidg
                /usr/sbin/pioctl internet 1
fi
                
/usr/sbin/pioctl status 2
begin=`date`
echo Remove start $begin >> /tmp/usb_remove_info
. /etc/init.d/swap_rmpoint.sh
#remove sdx_type
check_dev_flag
#restart swap
#while read SWPATH SWTYPE SWSIZE SWUSED SWPRI;do
#        if [ $SWPATH == "Filename" ]; then
#                continue
#        fi
#        if [ -z $SWPATH ]; then
#                break
#        fi
#        tmp=`free`
#        echo "$tmp" > /tmp/swapinfo
#        while read name total used free shared buffers;do
#                if [ "$name" == "Swap:" ];then
#                        if [ $used -ne 0 ]; then
#                                swapoff $SWPATH
#                                swapon $SWPATH
#                                /etc/init.d/swap_addr.sh
#                        fi
#                        break
#                fi
#        done < /tmp/swapinfo
 
#done < /proc/swaps
#restart dlna service
if [ -e /etc/init.d/minidlna.sh ]; then
	/etc/init.d/minidlna.sh stop
	/etc/init.d/minidlna.sh start 
fi
backup.sh stop
rm -f /var/log/sdbackup_process.log

#restart samba service
if [ -e /etc/rc.d/rc1.d/S32smbd ];then
	/etc/init.d/smb.sh restart
else
	/usr/sbin/update_smb /etc/samba/smb.conf
fi
#Stop wink status LED
/usr/sbin/pioctl status 3
/usr/sbin/pioctl status 0
if [ -e /var/lock/wifidg ]; then
	rm -fr /var/lock/wifidg
	/usr/sbin/pioctl internet 0
fi

end=`date`
echo Remove end $end >> /tmp/usb_remove_info
if [ -e /var/lock/wifidg ]; then
        rm -fr /var/lock/wifidg
        /usr/sbin/pioctl internet 0
fi

