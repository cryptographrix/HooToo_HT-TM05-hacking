#!/bin/sh
. /etc/init.d/vstfunc
while read major minor blocks name; do
	str_func_strstr "$name" "sd"
	if [ $? -eq 0 ]; then
		continue
	fi
	len=${#name}
	if [ $len -ne 3 ];then
		continue
	fi
	echo "stop disk:/dev/$name"
	/usr/sbin/sg_ioctl_disk /dev/$name 0
done < /proc/partitions
