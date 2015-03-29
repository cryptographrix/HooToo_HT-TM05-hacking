#!/bin/sh
. /etc/init.d/vstfunc
#global value
export PATH=/bin:/sbin:/usr/bin:/usr/sbin
MOUNTPATH=/data
mounted_flag=0

# Startup flag
. /tmp/startupflag
echo STARTUP_step0=$STARTUP >> /tmp/usb_add_info
if [ -z $STARTUP ]; then
        STARTUP=0
fi
echo STARTUP_step1=$STARTUP >> /tmp/usb_add_info
if [ $STARTUP -eq 1 ]; then
        exit 0
fi

USB_DEV_NAME=$1
USB_ADD_DEV=${USB_DEV_NAME:0:3}
USB_ADD_DEV_NUM=${USB_DEV_NAME:3:4}
# Must sleep to use lock
if [ ! -z $USB_ADD_DEV_NUM ]; then
	sleep $USB_ADD_DEV_NUM
fi

# Lock usb adding operation                                                                                             
if [ -f /var/lock/usb_add_$USB_ADD_DEV.lock ];then                                                                      
        echo "$1: Exist usb_add_$USB_ADD_DEV.lock" >> /tmp/usb_add_info                                                     
        exit 0                                                                                                          
else
        touch /var/lock/usb_add_$USB_ADD_DEV.lock                                                                       
	echo "$1: Create usb_add_$USB_ADD_DEV.lock" >> /tmp/usb_add_info
fi  

echo "$1: $USB_DEV_NAME $USB_ADD_DEV" >> /tmp/usb_add_info

#function
disk_fsk() {
  case "$4" in
    ntfs)
        echo "[$2] Checking NTFS Filesystem..."
        umount /dev/"$2" > /dev/null 2>&1
        /usr/sbin/chkntfs -f /dev/"$2"
        mount -t ufsd -o uid=15,nls=utf8,umask=0000,fmask=0000,dmask=0000,quiet,sparse,force /dev/"$2" "$1/$3" > /dev/null 2>&1
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
  mount -t ufsd -o uid=15,nls=utf8,umask=0000,fmask=0000,dmask=0000,quiet,sparse,force /dev/"$2" "$1/$3" > /dev/null 2>&1
  if [ $? -ne 0 ];then
    mount -t vfat -o rw,umask=0000,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
    if [ $? -ne 0 ];then
      mount -t ext3 -o rw,acl "/dev/$2" "$1/$3" > /dev/null 2>&1
      if [ $? -ne 0 ];then
        mount -t xfs -o rw,noatime "/dev/$2" "$1/$3" > /dev/null 2>&1
        if [ $? -ne 0 ];then
                mount.exfat-fuse -o rw,umask=000,noatime,async,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
                if [ $? -ne 0 ];then
                        ntfs-3g -o uid=15,gid=0,nls=utf8,umask=0000,fmask=0000,dmask=0000,recover,noatime,force /dev/"$2" "$1/$3" > /dev/null 2>&1
                                if [ $? -ne 0 ];then
                                        echo "Fail to Mount /dev/$2 on $1/$3" > /dev/null 2>&1
                                fi
                fi
        fi
      fi
    fi
  fi
}

all_mount() {
        case "$4" in
        ntfs)
                mount -t ufsd -o uid=15,nls=utf8,umask=0000,fmask=0000,dmask=0000,quiet,sparse,force /dev/"$2" "$1/$3" > /dev/null 2>&1
                if [ $? -ne 0 ]; then
                        try_mount $1 $2 $3 $4
                fi
                ;;
	fat16|fat32|vfat)
                mount -t vfat -o rw,umask=0000,iocharset=utf8 "/dev/$2" "$1/$3" > /dev/null 2>&1
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
		mounted_flag=1
        fi

	# mkdir .vst and create usb event
        mkdir -p $1/$2/.vst
        /usr/sbin/mkusbevent $1/$2 1

        # on led
        /usr/sbin/usbledck 0 $USB_ADD_DEV

	return 1
}

#
# Main operations
#

# Wink the status LED
/usr/sbin/pioctl status 2

# Waiting to finish usb remove $USB_ADD_DEV
if [ -f /var/lock/usb_remove_$USB_ADD_DEV.lock ];then
	echo "$1: Get the USB remove lock" >> /tmp/usb_add_info
	sleep 10
	if [ -f /var/lock/usb_remove_$USB_ADD_DEV.lock ]; then
		rm -rf /var/lock/usb_add_$USB_ADD_DEV.lock
		/usr/sbin/pioctl status 3
		echo "$1: Exit: Waiting usb add lock timeout" >> /tmp/usb_add_info
		exit 2	
	fi
fi

# Check exist
echo "$1: Check /dev/$1" >> /tmp/usb_add_info
if [ ! -e /dev/$1 ];then
	# Unlock usb adding operaiton
	echo "$1: Exit: Lost /dev/$1" >> /tmp/usb_add_info
	rm -rf /var/lock/usb_add_$USB_ADD_DEV.lock
	/usr/sbin/pioctl status 3
	exit 1
fi

# Check mount
echo "$1: Check mount $1" >> /tmp/usb_add_info
check_dev $1
if [ $? -ne 0 ];then
	#Unlock usb adding operaiton
	echo "$1: Exit: Miss /dev/$1" >> /tmp/usb_add_info
	rm -rf /var/lock/usb_add_$USB_ADD_DEV.lock
	/usr/sbin/pioctl status 3
        exit 1
fi

#Get diskinfo
diskck
MNAME=`echo $1 | cut -c -3` 
s_str=`ls -l /sys/block/$MNAME/device`
# check usb
str_func_strstr "$s_str" "usb"
if [ $? -eq 1 ];then
	exit_flag=0
	# main
#	if [ "$1" == "$USB_ADD_DEV" ]; then
#		echo "$1: $MOUNTPATH/UsbDisk1 Volume1 $1" >> /tmp/usb_add_info
#		mount_mount $MOUNTPATH/UsbDisk1 Volume1 $1 "vfat"
#	fi
	while read PNAME PARTFLAG VOLUME;do
		P=${PNAME##*/}
		while read DEVTAG HDTAG HDNUM; do
			str_func_strstr "$s_str" "$DEVTAG"
			if [ $? -eq 1 ];then
				devname=${P:0:3}
				if [ "$devname" == "$USB_ADD_DEV" ] && [ "$1" == "$USB_ADD_DEV" ]; then
					echo "$1: $MOUNTPATH/$HDTAG$HDNUM $VOLUME $1" >> /tmp/usb_add_info
					mount_mount $MOUNTPATH/$HDTAG$HDNUM $VOLUME $1 $PARTFLAG
					exit_flag=1
					break
				fi
				if [ "$devname" == "$USB_ADD_DEV" ] && [ "$1" != "$USB_ADD_DEV" ]; then
					echo "$1: $MOUNTPATH/$HDTAG$HDNUM $VOLUME $P" >> /tmp/usb_add_info
					mount_mount $MOUNTPATH/$HDTAG$HDNUM $VOLUME $P $PARTFLAG
					break
				fi
			fi
		done < /etc/init.d/disktag
		if [ $exit_flag == 1 ]; then
			break
		fi
	done < /var/tmp/diskpartinfo
fi

# Unlock usb adding operaiton                                         
rm -rf /var/lock/usb_add_$USB_ADD_DEV.lock

# Restart samba service
if [ -e /etc/rc.d/rc1.d/S32smbd ] && [ $STARTUP -ne 1 ]; then
        echo "$1: /etc/init.d/smb.sh restart" >> /tmp/usb_add_info
        /etc/init.d/smb.sh restart
fi
#if [ -e /etc/rc.d/rc1.d/S33ftpd ] && [ $STARTUP -ne 1 ]; then
#        echo "$1: /etc/init.d/ftp.sh restart" >> /tmp/usb_add_info
#        /etc/init.d/ftp.sh restart
#fi
#if [ -e /etc/rc.d/rc1.d/S75fileserv ] && [ $STARTUP -ne 1 ]; then
#        echo "$1: /etc/init.d/fileserv.sh restart" >> /tmp/usb_add_info
#        /etc/init.d/fileserv.sh restart
#fi


# Stop to wink the status LED
/usr/sbin/pioctl status 3

echo "$1: Exit: Normal" >> /tmp/usb_add_info
exit

