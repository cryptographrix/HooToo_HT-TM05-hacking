#!/bin/sh
. /etc/init.d/vstfunc
#global value
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
MOUNTPATH=/data
VERSION="/proc/vstinfo"
mounted_flag=0
FAIL=""
s_str=""
READAHEAD_SIZE=64KB
# Startup flag
. /tmp/startupflag

USB_DEV_NAME=$1
if [ -f /etc/f_dir/wifidg_led -a $internet -eq 0 ]; then
        touch /var/lock/wifidg
        /usr/sbin/pioctl internet 1
fi

#modify by zhangwei 20131106 compatible with Toshiba SD
str_func_strstr $1 "sd"
if [ $? -eq 1 ]; then
	USB_ADD_DEV=${USB_DEV_NAME:0:3}
	USB_ADD_DEV_NUM=${USB_DEV_NAME:3:4}
else
	#mmcblk0
	USB_ADD_DEV=${USB_DEV_NAME:0:7}
	USB_ADD_DEV_NUM=${USB_DEV_NAME:8:1}
fi

#function
disk_fsk() {
  case "$4" in
    ntfs)
        echo "[$2] Checking NTFS Filesystem..."
        umount /dev/"$2" > /dev/null 2>&1
        /usr/sbin/chkntfs -f /dev/"$2"
	ntfs-3g -o uid=15,gid=0,nls=utf8,umask=0000,fmask=0000,dmask=0000,recover,noatime,force /dev/"$2" "$1/$3" > /dev/null 2>&1
	sleep 2
    ;;
    vfat)
        echo "[$2] Checking FAT16/32 Filesystem..."
        umount /dev/"$2" > /dev/null 2>&1
        /usr/sbin/dosfsck -a -f -w /dev/"$2"
        mount -t vfat -o rw,umask=0000,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
	sleep 2
	rm -rf $1/$3/fsck0*.rec
    ;;
    xfs)
        echo "[$2] Checking XFS Filesystem..."
        umount /dev/"$2" > /dev/null 2>&1
        /usr/sbin/fsck.xfs /dev/"$2"
        mount -t xfs -o rw,noatime "/dev/$2" "$1/$3" > /dev/null 2>&1
	sleep 2
    ;;
    *)
        return 0
  esac
}

check_dev(){
        while read device mountpoint fstype remainder; do
        if [ $device == "/dev/$1" ];then
                echo "$1: mounted $1 " >> /tmp/usb_add_info
                return 1
        fi
        done < /proc/mounts
        return 0
}

try_mount() {           
	nice -n 10 mount -t tfat -o rw,umask=0000,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
	if [ $? -ne 0 ];then
		mount -t vfat -o rw,umask=0000,iocharset=utf8,shortname=mixed "/dev/$2" "$1/$3" > /dev/null 2>&1
		if [ $? -ne 0 ];then
			nice -n 10 mount -t texfat -o umask=000,readahead=$READAHEAD_SIZE "/dev/$2" "$1/$3" > /dev/null 2>&1
			if [ $? -ne 0 ];then
				mount.exfat-fuse -o rw,umask=000,noatime,nonempty,async,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
				if [ $? -ne 0 ];then
					nice -n 10 mount -t thfsplus -o rw,umask=0000,nomode "/dev/$2" "$1/$3" > /dev/null 2>&1
					if [ $? -ne 0 ];then
						FAIL=$2
						echo FAIL=$2 >> /tmp/usb_add_info
						#remove mount point
						rmdir  "$1/$3"
					fi
				#	nice -n 10 chmod -R 777 "$1/$3/" &
	                        fi
			fi      
		fi         
	fi   
} 

all_mount() {
        case "$4" in
        ntfs)
  		nice -n 10 mount -o readahead=$READAHEAD_SIZE -t tntfs /dev/"$2" "$1/$3" > /dev/null 2>&1
                if [ $? -ne 0 ]; then
                        try_mount $1 $2 $3 $4
                fi
                ;;
	fat16|fat32|vfat)
                #mount -t vfat -o rw,umask=0000,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
  		nice -n 10 mount -o readahead=$READAHEAD_SIZE -t tntfs /dev/"$2" "$1/$3" > /dev/null 2>&1
                if [ $? -ne 0 ]; then
                        try_mount $1 $2 $3 $4
                fi
                ;;
        ext3)
                mount -t ext3 -o rw "/dev/$2" "$1/$3" > /dev/null 2>&1
                if [ $? -ne 0 ]; then
                        try_mount $1 $2 $3 $4
                fi
                ;;
        xfs)
                mount -t xfs -o rw,noatime "/dev/$2" "$1/$3" > /dev/null 2>&1
                if [ $? -ne 0 ]; then
                        try_mount $1 $2 $3 $4
                fi
                ;;
        *)
                return 0
        esac
}

check_mount() {
        while read device mountpoint fstype remainder; do
        if [ $mountpoint == "$1/$2" ];then
                echo "$1: mount $1/$2 success" >> /tmp/usb_add_info
                return 1
        fi
        done < /proc/mounts
        return 0
}

mkdir_mount() {
        if [ ! -d $1/$2 ]; then
                mkdir -m 777 -p $1/$2 > /dev/null 2>&1
        fi
	all_mount $1 $3 $2 $4
        chmod 777 $1/$2 > /dev/null 2>&1
}

mount_mount() {
	check_mount $1 $2 $3
	if [ $? -eq 1 ]; then
		echo "mounted $1 $2 $3"
		return 1
	fi

	#Check 	
	mkdir_mount $1 $2 $3 $4
	sleep 1
	check_mount $1 $2 $3
	if [ $? -eq 0 ];then
		echo "Fail to mount $1 $2 $3"
		return 1
	else
		echo "success to mount $1 $2 $3"
		mounted_flag=1
        fi

	# mkdir .vst and create usb event
        mkdir -p $1/$2/.vst
        /usr/sbin/mkusbevent $1/$2 1
	#add by mengqingyong 2013-0729
	local shareuser=`cat /etc/firmware | grep "SHAREUSER=OK"`
	if [ -n "$shareuser" ]; then
		if [ ! -d $1/$2/Share ]; then
                	mkdir  $1/$2/Share
                	echo mkdir  $1/$2/Share >>  /tmp/usb_add_info
        	fi
	fi

        # on led
#        /usr/sbin/usbledck 0 $USB_ADD_DEV

	return 1
}

check_swap() {
        while read SWPATH SWTYPE SWSIZE SWUSED SWPRI;do
        if [ $SWPATH == "Filename" ]; then
                continue
        fi
        if [ $SWPATH == "" ]; then
                echo "no swap"
                return 0
        else
                echo $SWPATH
                echo "have swap"
                return 1
        fi
        break
done < /proc/swaps
}
#remove the old firmware
remove_firm(){
	rmversion=$(sed -n '/CURVER=/p' $VERSION | cut -d = -f 2)
	while read device mountpoint fstype remainder; do
        str_func_strstr "$mountpoint" "UsbDisk"
        if [ $? -eq 0 ]; then
                continue
        fi
	#remove .vst directory firmware
	rm -f $mountpoint/.vst/fw*2.000.*
        if [ -e $mountpoint/.vst/upgrade/*$rmversion* ]; then
        #        echo $mountpoint/.vst/upgrade/*$rmversion*
                rm -fr $mountpoint/.vst/upgrade/*$rmversion*
        fi
        if [ -e $mountpoint/.vst/upfs ]; then
        #        echo $mountpoint/.vst/upfs
                rm -fr $mountpoint/.vst/upfs
        fi
done < /proc/mounts
}
#20130722 find disk dose not have sda1 node ,but it has sda4 node, this fix the bug
find_sdx1(){
	while read PNAME PARTFLAG VOLUME;do
		if [ "$PNAME" == "$1"1 ]; then
			return 1
		fi
	done < /tmp/diskpartinfo
	
	return 0
}
find_vale(){
	find_sdx1 "$1"
	sdx1=$?
       	local flag=0 
	if [ $sdx1 -eq 1 ]; then
                return 0
        fi
	while read PNAME PARTFLAG VOLUME;do
		if [ "$PNAME" == "$1" ]; then
			return 1
		fi
		tmp=${PNAME:0:3}
                if [ $tmp != "$1" ]; then
                        continue
                fi
		zmajor=`cat /sys/block/"${PNAME:0:3}"/"$PNAME"/dev | cut -d ':' -f1`
		zminor=`cat /sys/block/"${PNAME:0:3}"/"$PNAME"/dev | cut -d ':' -f2`
		mknod /dev/"$PNAME" b $zmajor $zminor > /dev/null 2>&1
		flag=1
	done < /tmp/diskpartinfo
	if [ $falg -eq 0 ]; then
		return 0
	elif [ $flag -eq 1 ]; then
		return 1
	fi
	
}
samba_service(){
	echo 1 > /proc/sys/vm/drop_caches
	if [ -e /etc/rc.d/rc1.d/S32smbd ]; then
		echo "/etc/init.d/smb.sh restart" >> /tmp/usb_add_info
		/etc/init.d/smb.sh restart
	else
		/usr/sbin/update_smb /etc/samba/smb.conf
	fi
}
dlna_service(){
	echo 1 > /proc/sys/vm/drop_caches
	if [ -e /etc/init.d/minidlna.sh ]; then
		echo "/etc/init.d/minidlna.sh start" >> /tmp/usb_add_info
		/etc/init.d/minidlna.sh start & 
	fi
}
xl_service(){
        echo 1 > /proc/sys/vm/drop_caches
        if [ -e /etc/init.d/xl.sh ]; then
                echo "/etc/init.d/xl.sh start" >> /tmp/usb_add_info
                /etc/init.d/xl.sh restart &
        fi
}
swap_on(){
	check_swap
	if [ $? -eq 0 ];then
	        while read device mountpoint fstype remainder; do
	                str_func_strstr "$device" "/dev/sd"
	                if [ $? -eq 1 ];then
	                        echo /etc/init.d/swap $mountpoint >> /tmp/usb_add_info
	                        echo 1 > /proc/sys/vm/drop_caches
	                        mkdir -p $mountpoint/.vst
	                        /etc/init.d/swap $mountpoint
	                        break
	                fi
	        done < /proc/mounts
	fi
	#start the dlna service
#	/etc/init.d/minidlna.sh start &
}
get_type(){
        #if [ $# != 1 -o ${#1} -ne 3 ]; then
        if [ $# != 1 ]; then
                echo Usage: get_type.sh \<sdx\>
                return 1
        fi
        if [ ! -e /etc/init.d/disknicky ]; then
                echo /etc/init.d/disknicky dose not exist
                return 2
        fi
        link=`readlink /sys/block/$1`
        str_func_strstr $link "usb"
        if [ $? -eq 0 -o "$link" == "" ]; then
                link=`readlink /sys/block/$1/device`
                if [ "$link" == "" ]; then
                        echo readlink failed
                        return 3
                fi
        fi
        echo link=$link
        while read usbaddr flag; do
                str_func_strstr $link $usbaddr
                if [ $? -eq 1 ]; then
                        echo $flag > /tmp/"$1"_type
                fi
        done < /etc/init.d/disknicky
}
#add by zhangwei 20131106
#return 0 successful
#return 1 failed
read_link(){
	s_str=`readlink /sys/block/$1/device`
	str_func_strstr "$s_str" "$2"
	if [ $? -eq 0 ]; then
		s_str=`readlink /sys/block/$1`
		str_func_strstr "$s_str" "$2"
		if [ $? -eq 0 ]; then
			echo read link failed
			return 1
		fi
		return 0
	fi	
	return 0
}
#
# Main operations
#
#Erase GPT information and check if exist sd*
if [ "$USB_ADD_DEV" == "$1" ]; then
        echo "Erase GPT information and Get diskinfo" >> /tmp/usb_add_info
        /usr/sbin/disk_clear_gpt_info
	diskck
	find_vale $1
	if [ $? -eq 0 ]; then
		if [ -e /var/lock/wifidg ]; then
       			rm -fr /var/lock/wifidg
       		 	/usr/sbin/pioctl internet 0
		fi
	exit 
	fi
fi
# Wink the status LED
udevtime=`date +%s`
echo $udevtime > /tmp/udevtime
systime=`cat /tmp/systime`
let ideltime=$udevtime-$systime
if [ $STARTUP -eq 0 ]; then
        if [ -f /tmp/stfirst ]; then
                rm /tmp/stfirst
                if [ $ideltime -gt 5 ]; then
                        /usr/sbin/pioctl status 2
                fi
        else
                /usr/sbin/pioctl status 2
        fi
else
        if [ -f /tmp/stfirst ]; then
                rm /tmp/stfirst
        fi
fi


# Check exist
echo "$1: Check /dev/$1" >> /tmp/usb_add_info
if [ ! -e /dev/$1 ];then
	# Unlock usb adding operaiton
	echo "$1: Exit: Lost /dev/$1" >> /tmp/usb_add_info
	/usr/sbin/pioctl status 3
	if [ -e /var/lock/wifidg ]; then
       		rm -fr /var/lock/wifidg
        	/usr/sbin/pioctl internet 0
	fi

	exit 1
fi

# Check mount
echo "$1: Check mount $1" >> /tmp/usb_add_info
check_dev $1
if [ $? -ne 0 ];then
	#Unlock usb adding operaiton
	echo "$1: Exit: Miss /dev/$1" >> /tmp/usb_add_info
	#/usr/sbin/pioctl status 3
        #exit 1
fi

#Get diskinfo
#check usb first
#modify by zhangwei 20131106
read_link "$USB_ADD_DEV" "usb"
if [ $? -eq 1 ]; then
	echo "read_link $USB_ADD_DEV usb failed"
	read_link "$USB_ADD_DEV" "mmc"
	if [ $? -eq 1 ]; then
		echo "read_link $USB_ADD_DEV mmc failed"
		/usr/sbin/pioctl status 3

		if [ -e /var/lock/wifidg ]; then
        		rm -fr /var/lock/wifidg
        		/usr/sbin/pioctl internet 0
		fi
		
         exit 1
	fi

fi
	# main
while read PNAME PARTFLAG VOLUME;do
	P=${PNAME##*/}
	str_func_strstr "$P" "$USB_ADD_DEV"
	if [ $? -eq 0 ]; then
		continue
	fi 
	while read DEVTAG HDTAG HDNUM; do
		str_func_strstr "$s_str" "$DEVTAG"
		if [ $? -eq 1 ];then
			echo "$1: $MOUNTPATH/$HDTAG$HDNUM $VOLUME $P" >> /tmp/usb_add_info
			mount_mount $MOUNTPATH/$HDTAG$HDNUM $VOLUME $P $PARTFLAG
			break
		fi
	done < /etc/init.d/disktag
done < /tmp/diskpartinfo

#
# Create the swap file
productline=`cat /etc/firmware | grep PRODUCTLINE | cut -d "=" -f2`
str_func_strstr "$productline" "HDD"
if [ $? -eq 1 ]; then
	swap_on
fi
#swap_on
#dlna
dlna_service
xl_service
if [ -f /usr/sbin/dropbox ]; then
	/usr/sbin/dropbox
fi
if [ -f /usr/sbin/baidupcs ]; then
	/usr/sbin/baidupcs
fi
if [ -f /etc/init.d/mipsp2p.sh ]; then
	/etc/init.d/mipsp2p.sh restart
fi
#samba
if [ ${#1} -eq 3 -a "$FAIL" == "$1" ]; then
	echo Do not need restart samba
else
	samba_service
fi
str_func_strstr $1 "sd"
if [ $? -eq 1 ]; then
	echo "it is hdd"
else
	if [ -f /etc/autocp.config ]; then
		autoflag=`cat /etc/autocp.config | grep auto |awk -F '=' '{print $2}'`
		user=`cat /etc/autocp.config | grep user |awk -F '=' '{print $2}'`
		if [ $autoflag -eq 1 ];then
			backup.sh  stop
			backup.sh  start $user &
		fi
	fi
#echo 6 > /proc/vs_sd_spin_down
	
fi
#for listen disk
get_type $USB_ADD_DEV
echo touch /tmp/"$USB_ADD_DEV"_plugflag >> /tmp/usb_add_info
touch /tmp/"$USB_ADD_DEV"_plugflag
echo remove_firm >> /tmp/usb_add_info
remove_firm
# Stop to wink the status LED
/usr/sbin/pioctl status 3
/usr/sbin/pioctl status 0
#factory seting
if [ -e  /data/UsbDisk1/Volume1/EnterRouterMode.sh ]; then
        /data/UsbDisk1/Volume1/EnterRouterMode.sh
elif [ -e  /data/UsbDisk2/Volume1/EnterRouterMode.sh ]; then
        /data/UsbDisk2/Volume1/EnterRouterMode.sh
fi

if [ -e /var/lock/wifidg ]; then
        rm -fr /var/lock/wifidg
        /usr/sbin/pioctl internet 0
fi

echo "$1: Exit: Normal" >> /tmp/usb_add_info
exit

