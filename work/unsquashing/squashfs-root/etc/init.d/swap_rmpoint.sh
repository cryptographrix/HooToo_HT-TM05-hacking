#!/bin/sh
. /etc/init.d/vstfunc
#funciton
check_mount() {
        echo check_mount $1
        while read device tmountpoint fstype remainder; do
                if [ "$device" == "$1" ];then
                        return 1
                fi
        done < /proc/mounts
        return 0
}
remove_dir(){
	str_func_strstr "$1" "UsbDisk1"
	if [ $? -eq 1 ]; then 
		rmdir /data/UsbDisk1/
	fi
        str_func_strstr "$1" "UsbDisk2"
        if [ $? -eq 1 ]; then
                rmdir /data/UsbDisk2/
        fi
}
#main
while true; do
	count=0
	while read device mountpoint fstype remainder; do
		str_func_strstr "$mountpoint" "UsbDisk"
		if [ $? -eq 0 ]; then
			continue
		fi	
		devname=${device:5:3}
		#modify by zhangwei 20131106 compatibla with Toshiba Sd
		if [ $devname == "mmc" ]; then
			echo Toshiba SD handle >> /tmp/usb_remove_info
			devname=${device:5:7}
		fi
		echo devname=$devname--device=$device
		#if [ -d /sys/block/$devname ];then
		#	echo /sys/block/$devname OK
		#	continue
		#fi
		num=0
		while read major minor blocks name; do
			str_func_strstr "$name" "$devname"
			if [ $? -eq 0 ]; then
				continue
			else
				num=1
				break
			fi
		done < /proc/partitions
		
		if [ $num -eq 1 ]; then
			continue	
		fi
		#rm the useless mountpoint
		echo umount $device
		tyrnum=1
		while [ $tyrnum -le 3 ]; do
			/bin/umount -f $device
			check_mount $device
			if [ $? -eq 0 ]; then
				#service for dlna
				rmdir $mountpoint
				remove_dir $mountpoint
				#remove the /dev/*
				rm -fr /dev/$devname*
				rm -rf /tmp/"$devname"_plugflag
				break
			else
				let tyrnum=$tyrnum+1
			fi
		done
		echo trunum=$tyrnum
		if [ $tyrnum -eq 4 ];then
			/usr/sbin/umount2 $mountpoint
			rmdir $mountpoint
			remove_dir $mountpoint
			rm -fr /dev/$devname*	
			rm -rf /tmp/"$devname"_plugflag
		else
			echo umount succeful
		fi
		count=1
		break
	done < /proc/mounts
	if [ $count -eq 0 ]; then
		echo remove finish
		break
	fi
done
