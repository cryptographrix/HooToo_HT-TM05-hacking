#!/bin/sh
# constant
FWCFPT=/proc/vstinfo
. ./firmware/firmware.conf
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
stop_watchdog()
{
	diswatchdog
	sleep 1
}

#ls -l /bin/diswatchdog > /data/UsbDisk1/Volume1/diswatchdog.log
stop_watchdog
/bin/pioctl status 2
if [ $NEWBUILD -ne 0 ]; then
	# update firmware
#	upstat 1 6
#	echo " back firmware"
#	up_backup $NEWBUILD
#	if [ $? -ne 0 ]; then
#        	exit 1
#	fi
	echo "update firmware"
	up_update $NEWBUILD
#	if [ $? -ne 0 ];then
#		echo "update firmware failure"
#		up_resume $NEWBUILD
#		upstat 2 6
#       	exit 1
#	fi
	sync
	sync
	echo "sync firmware"
fi
# update ok
upstat 1 100
sed "s/^UPSTAT=[0-9]*/UPSTAT=100/g" $FWCFPT > $FWCFPT
sed "s/^ERRSTAT=[0-9]*/ERRSTAT=0/g" $FWCFPT > $FWCFPT
sed "s/^CURFILE=*.*/CURFILE=$NEWFILE/g" $FWCFPT > $FWCFPT
sed "s/^CURVER=*.*/CURVER=$NEWVER/g" $FWCFPT > $FWCFPT
# sync
sync
sync
echo "update finish"

#enable poweroff key for toshiba
echo 1 > /proc/vs_poweroff_key_status


#flash_eraseall /dev/mtd7
/bin/sleep 10
/bin/pioctl status 3


/bin/reboot -f
exit $?
