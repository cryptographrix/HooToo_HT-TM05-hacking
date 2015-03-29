#!/bin/sh
# constant
CRCSUM=2752227979
VENDOR=HooToo
PRODUCTLINE=WiFiDGRJ
SKIP=228
TARGET_OS="linux"
TARGET_ARCH="arm"
DEVICE_TYPE=HT-TM05
VERSION=2000022
CPU=7620
if [ "$1" = "" ]; then
       FWPT="/data/UsbDisk1/Volume1/.vst/"
else    
       FWPT=$1
fi
#FWPT="/data/UsbDisk1/Volume1/.vst/"
#FWPT="/tmp"
FWCFPT="/proc/vstinfo"
SRVLIST="mlnet.sh ftp.sh nfs.sh smb.sh xl.sh ushare.sh mt-daapd.sh ddns.sh serverdev.sh fileserv.sh upnpc.sh ntp.sh web upnpd.sh upnpc.sh nasclient.sh minidlna.sh"
SPELIST="vst_daemon etc_tools web ioos usbdongled led_control au pppd upnpd listen_sleep.sh udhcpc udhcpd ntp vstddns ntpclient dropbox p2pset.sh mipsp2p listen_sleep control"
ETCMTD="/dev/mtd6"
# function
upstat() {
        if [ $1 -eq 1 ]; then
                sed "s/^UPSTAT=[0-9]*/UPSTAT=$2/g" $FWCFPT > $FWCFPT
        elif [ $1 -eq 2 ]; then
                sed "s/^UPSTAT=[0-9]*/UPSTAT=0/g" $FWCFPT > $FWCFPT
                sed "s/^ERRSTAT=[0-9]*/ERRSTAT=$2/g" $FWCFPT > $FWCFPT
        else
                return 1
        fi

}
checkmount() {
        LINE=`mount | cut -d" " -f3`
        for p in $LINE
        do
                if [[ "$p" == /opt* ]]; then
                        umount -f $p
                fi
        done

}
extendfunc() {
#        if [ -e $ETCMTD ];then
#                /bin/flash_eraseall $ETCMTD > /dev/null 2>&1
#        fi
	/bin/mtd_write erase /dev/mtd6
	/bin/mtd_write erase /dev/mtd7
	if [ -f "/boot/tmp/etcbackup.tar.gz" ];then
	    /usr/sbin/etc_tools p 7 /boot/tmp/etcbackup.tar
	fi

#        umount -f /etc > /dev/null 2>&1
#        if [ -e /boot/tmp/etc ];then
#                rm -rf /boot/tmp/etc > /dev/null 2>&1
#        fi
}
chgusrhome() {
        if [ -f /tmp/passwd ]; then
                rm -f /tmp/passwd
        fi
        if [ -f /tmp/passwd- ]; then
                rm -f /tmp/passwd-
        fi
        awk -F: '{print $1,$2,$3,$4,$5,$6,$7}' /etc/passwd > /tmp/passwd
        while read USER UX USERID GRPID NOTE HDIR HSHELL; do
                if [ $USERID -eq 15 ]; then
                        echo "$USER:$UX:$USERID:$GRPID:user:/data:/bin/sh" >> /tmp/passwd-
                else
                        if [ $USERID -gt 499 ] && [ $USERID -lt 65534 ]; then
                                echo "$USER:$UX:$USERID:$GRPID:$NOTE:/data:$HSHELL" >> /tmp/passwd-
                        else
                                if [ $USERID -eq 8 ]; then
                                        echo "$USER:$UX:$USERID:$GRPID:mail:/var/mail:/bin/sh" >> /tmp/passwd-
                                else
                                        echo "$USER:$UX:$USERID:$GRPID:$NOTE:$HDIR:$HSHELL" >> /tmp/passwd-
                                fi
                        fi
                fi
        done < /tmp/passwd
 
        if [ -f /etc/passwd ]; then
                cp /tmp/passwd- /etc/passwd
        fi
}

# check crc
upstat 1 1
echo "check firmware crc"
crcsum=`sed '1,3d' $0|cksum|sed -e 's/ /Z/' -e 's/   /Z/'|cut -dZ -f1`
[ "$crcsum" != "$CRCSUM" ] && {
        echo "firmware crc error!"
        upstat 2 1
        exit 1
}
echo "firmware crc success!"

#disable poweroff key for toshiba
if [ -f /proc/vs_poweroff_key_status ];then
	echo 0 > /proc/vs_poweroff_key_status
fi

sleep 2

# check device type
upstat 1 2
#echo "check device tpye"
tmpver=`awk -F= '/^CURFILE/{print $2}' $FWCFPT`
if [ "$tmpver" -ne "$DEVICE_TYPE" ];then
	if [ "$tmpver" -ne "wifi-disk" ];then
        	echo "Device type error!please check your device type!"
        	upstat 2 2
        	exit 1
	fi
fi

# close service 
upstat 1 3
# wait web
sleep 5
close_services()
{
	echo "close services, waiting ..."
	for ser in $SRVLIST
	do
        	if [ -e /etc/init.d/$ser ]; then
                	/etc/init.d/$ser stop > /dev/null 2>&1
 	       fi
	done
	# close spe service
	for spefile in $SPELIST
	do
        	rm -f /var/run/$spefile*  > /dev/null 2>&1
	done
	spepid=`pidof $SPELIST`
	for pid in $spepid
	do
        	kill -9 $pid > /dev/null 2>&1
	done
}
close_services

#add by ljd
#down all net interforce
{
	for IF in `ifconfig | cut -d' ' -f1 | sed '/^$/d'`
	do
		ifconfig $IF down 1>/dev/null 2>&1
	done

}
#close all app
{
	SELF_PID=$$
	ps aux > /tmp/ps.log
	[ -n `pidof watchdog` ] && diswatchdog && sleep 1 && WPID=`pidof watchdog`

	while read USER       PID CPU MEM    VSZ   RSS TTY      STAT START   TIME COMMAN
	do
		[  $PID == 1 ] && continue
		[ "$SELF_PID" == "$PID" ] && continue
		[ "$TTY" != '?' ] && continue
		[ -n "$WPID" ] && [ "$SELF_PID" == "$PID" ] && continue
#		echo "Will kill $PID"
		kill -9 $PID 1>/dev/null 2>&1

#        	[ ! $PID == 1 ] && [ "$SELF_PID" != "$PID" ] && [ "$TTY" == '?' ] && echo "Will kill $PID" && kill -9 $PID 1>/dev/null 2>&1
	done < /tmp/ps.log
#	ps auxw
	sleep 1
#	ps aux > /data/UsbDisk1/Volume1/end_ps.log
#	sync
}
killall -KILL watchdog
echo 0 > /dev/watchdog

echo "services closed"
# Modify the password file
chgusrhome
sync
#/etc/init.d/etcsync
/etc/init.d/etcbak_firm_up
# extend operation
extendfunc

# untar
echo "unzip firmware package"
upstat 1 4
if [ -e "$FWPT/upfs.gz" ];then
        rm -f $FWPT/upfs.gz
fi
if [ -e "$FWPT/upfs" ];then
        rm -f $FWPT/upfs
fi
tail -n +$SKIP $0 > $FWPT/upfs.gz
if [ $? -ne 0 ]; then
        upstat 2 4
        exit 1
fi
# mount
upstat 1 5
checkmount
gzip -d $FWPT/upfs.gz
mount -o ro $FWPT/upfs /opt
if [ $? -ne 0 ];then
	#modify by zhangwei
	/usr/sbin/udevtrigger
	/bin/sleep 2
	mount -o ro $FWPT/upfs /opt
	if [ $? -ne 0 ];then	
	        upstat 2 5
	        exit 1
	fi
fi
cp -arfv /dev/* /opt/dev/ > /dev/null 2>&1
#close udev telnet zhangwei
killall -kill udevd
#killall -kill telnetd
# chroot
echo "start update firmware"


chroot /opt /etc/initsh
exit 0
END_OF_STUB
