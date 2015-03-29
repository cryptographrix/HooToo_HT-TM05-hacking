#!/bin/sh
swap_path=""
swap_dev=""
#funciton
str_func_strstr () {
        if [ ${#2} -eq 0 ];then
                echo "$1"
                return 0
        fi
        case "$1" in
                *$2*)
                        return 1
                        ;;
                *)
                        return 0
                        ;;
        esac
}
#Find the swap path
while read SWPATH SWTYPE SWSIZE SWUSED SWPRI;do
	if [ $SWPATH == "Filename" ]; then
		continue
	fi
	if [ $SWPATH == "" ]; then
		echo No swap
		exit 1
	else
		echo Find swap
		swap_path=`echo $SWPATH | cut -d'.' -f1`
	fi
done < /proc/swaps
#find the swap dev
while read device mountpoint fstype remainder; do
	if [ "$mountpoint/" == "$swap_path" ]; then
		swap_dev=${device:5:3}
		break
	fi
done < /proc/mounts
if [ -z $swap_dev ]; then
	echo swap_dev error
	exit 1
fi
swap_hub=`ls -l /sys/block/$swap_dev/device`
echo swap_hub=$swap_hub
#find address
while read DEVTAG HDTAG HDNUM; do
	str_func_strstr "$swap_hub" "$DEVTAG"
	if [ $? -eq 1 ]; then
		swap_addr=`echo $DEVTAG | cut -d '/' -f3`
		if [ -z $swap_addr ];then 
			swap_addr=`echo $DEVTAG | cut -d '/' -f2`
		fi
	fi
done < /etc/init.d/disktag
if [ -z $swap_addr ];then 
	echo swap_addr error
	exit 1
fi
echo swap_addr=$swap_addr
swap_addnum=`ls /sys/bus/usb/drivers/usb/$swap_addr/ | grep "usb_device"|cut -d'.' -f2`
echo swap_addnum=$swap_addnum
#echo proc
echo $swap_addnum > /proc/swap_usbdev_num
exit 0
