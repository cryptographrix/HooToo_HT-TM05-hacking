#!/bin/sh
#quick umount all disk

kill_all_process(){
	sync
	kill -KILL -1
	sync
}

close_swap(){
	swapfile_path="$(grep swapfile /proc/swaps | awk '{print $1}')"
	[ -n "$swapfile_path" ] && (
		swapoff "$swapfile_path"
	) 
}

qiuck_umount(){
	while read dev mountpoit ftype option ; do
		[ -n "$(echo "$mountpoit" | grep data)" ] && (
			umount "$mountpoit"
			[ "$?" != "0" ] && umount2 "$mountpoit"
		) 
	done < /proc/mounts
}

disk_sleep_control(){
        while read major minor blocks name; do
                [ -n "$(echo $name | grep sd)" ] && [ ${#name} -eq 3 ] && {
                        /usr/sbin/sg_ioctl_disk /dev/$name 0
                }
        done < /proc/partitions
}

kill_all_process
close_swap
qiuck_umount
disk_sleep_control
