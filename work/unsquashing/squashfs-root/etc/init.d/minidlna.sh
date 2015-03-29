#!/bin/sh
# description: Starts and stop the minidlna manager daemons
#              used to provide web dlna services.
#pidfile: /var/run/minidlna.pid

#const
. /etc/init.d/vstfunc
PRGNAME=minidlna
SRVNAME=minidlna

#Function
start(){
	if [ -f /tmp/dlnatmp ];then
                exit 0
        fi
        touch /tmp/dlnatmp
        while [ ! -f /tmp/rcend ];do
                sleep 2
        done
        rm /tmp/dlnatmp
	#rm /tmp/dlna_child_process
	DEFAULTDIR=`cat /etc/minidlna.conf | grep "default_dir=" | awk -F"=" '{print $2}'`
	STAT=`cat /etc/minidlna.conf | grep "stat=" | awk -F"=" '{print $2}'`
	if [ $STAT = "0" ];then
		exit
	fi
	NAME=`cat /etc/minidlna.conf | grep "friendly_name" | awk -F"=" '{print $2}'`
    F="friendly_name"
    if [ -z $NAME ];then
            NAME_T=`nvram_get SSID1`
            NAME_T="DLNA-$NAME_T"
        sed -i "s/$F=$NAME/$F=$NAME_T/g" /etc/minidlna.conf
    fi

	if [ ! -e /tmp/dlna ];then
		mkdir /tmp/dlna
	fi
	M_PATH="/proc/mounts"
	TIME=0
	while true
	do
		MOUNT=`cat $M_PATH| grep "/dev/sd[a-z]" | awk '{print $2}'`
		if [ -z $MOUNT ];then
			let TIME=$TIME+1
			if [ "$TIME" -eq 5 ];then
				exit 0
			fi
			sleep 2
		else
			break
		fi
	done
	for CHECK in $MOUNT
	do
        #echo $CHECK
        SHARE=$CHECK/"$DEFAULTDIR"
#	if [ ! -e "$SHARE" ];then
#		if [ -e "$CHECK" ];then
			mkdir -p "${SHARE}"
			mkdir -p "${SHARE}"/Videos
			mkdir -p "${SHARE}"/Pictures
			mkdir -p "${SHARE}"/Music
			mkdir -p "${SHARE}"/Documents
#		fi
#	fi
	done
	SCAN_DIR=`cat /etc/minidlna.conf | grep "scan_dir=" | awk -F"=" '{print $2}'`
	if [ ! -e "$SCAN_DIR" ];then
		mkdir "$SCAN_DIR"
		mkdir "${SCAN_DIR}"/Videos
		mkdir "${SCAN_DIR}"/Pictures
		mkdir "${SCAN_DIR}"/Music
		mkdir "${SCAN_DIR}"/Documents
	fi
	UPDATEDB=`cat /etc/minidlna.conf | grep "UPDATE_DB=" | awk -F"=" '{print $2}'`	
	
	checkonly $PRGNAME
	if [ $? -eq 0 ];then
			exit 0
	fi
	if [ $UPDATEDB = "1" ];then
		rm /data/UsbDisk1/Volume1/.vst/i4dlna/i4dlna.db
		rm /data/UsbDisk1/Volume2/.vst/i4dlna/i4dlna.db
		sed -i "s/UPDATE_DB=1/UPDATE_DB=0/g" /etc/minidlna.conf

	fi
	#/data/UsbDisk1/Volume1/$PRGNAME
	/usr/sbin/$PRGNAME &
	if [ $? -eq 0 ];then
		savesc 3 /usr/sbin/$PRGNAME $SRVNAME
		#savesc 3 /data/UsbDisk1/Volume1/$PRGNAME
	fi
	touch /tmp/dlna_flag
	if [ $UPDATEDB = "1" ];then
		/etc/init.d/etcsync
	fi
	return $?

}

stop(){
	killproc $PRGNAME
	return $?
}

restart(){
	stop
	start
}

restartdb()
{
	rm -rf /data/UsbDisk1/Volume1/.vst/i4dlna
    db_path=`cat /tmp/dlna/dbpath`
    if [ ! -z "$db_path" ];then
#                echo "rm db"
	    rm -f "$db_path"/i4dlna.db
    fi

	restart
}

renet()
{
	echo 1 > /tmp/dlna/net_change
}
if [ ! -e /tmp/dlna ];then
	mkdir /tmp/dlna
fi
case "$1" in
		start)
				start
				;;
		stop)
				stop
				;;
		restart)
				restart	
				;;
		renet)		renet
				;;
		restartdb)
				restartdb
				;;
		*)
				echo $"Usage: $0 {start|stop|restart}"
				exit 1
		;;
esac

exit $?
