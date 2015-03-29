#!/bin/sh
. /etc/init.d/vstfunc
stop_one(){
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
}
stop_all(){
	while true; do
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
		sleep 2
	done
}
start_all(){
	while read major minor blocks name; do
		str_func_strstr "$name" "sd"
		if [ $? -eq 0 ]; then
			continue
		fi
		len=${#name}
		if [ $len -ne 3 ];then
			continue
		fi
		echo "start disk:/dev/$name"
		/usr/sbin/sg_ioctl_disk /dev/$name 1
	done < /proc/partitions
}
#select
case "$1" in
        start)
                start_all
        ;;
        stop)
		stop_all                
        ;;
        stop_one)
		stop_one                
        ;;
        *)
                echo $"Usage: $0 {start|stop}"
                exit 1
        ;;
esac

