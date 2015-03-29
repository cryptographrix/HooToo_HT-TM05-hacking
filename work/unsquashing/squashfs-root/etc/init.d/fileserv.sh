#! /bin/sh
# Const
PIDPATH=/var/run
PRGNAME=fileserv
SRVNAME=fileserv
# Source function library.
. /etc/init.d/vstfunc

# Function
start() {
    	#check
    	checkonly $PRGNAME
    	if [ $? -eq 0 ]; then
        	exit 0
    	fi
    	for i in `ls /data`; do
    	        for j in `ls /data/$i`; do
    	                mkdir -p /data/$i/$j/.vst/upload
    	                mkdir -p /data/$i/$j/.vst/tmp
			rm -f /data/$i/$j/.vst/fileserv*
    	        done
    	done
    	                        
#	if [ -e /data/UsbDisk1/Volume1/ ]; then
#		mkdir -p /data/UsbDisk1/Volume1/.vst/upload
#		mkdir -p /data/UsbDisk1/Volume1/.vst/tmp	
#	fi
#	if [ ! -f /data/UsbDisk1/Volume2/.vst/tmp ]; then
#		mkdir -p /data/UsbDisk1/Volume2/.vst/tmp
#	fi
	if [ ! -e /var/log/lighttpd ]; then
		mkdir -p /var/log/lighttpd
	fi
	if [ ! -e /var/cache/lighttpd ]; then
		mkdir -p /var/cache/lighttpd
	fi

#	nice -n 10 /usr/sbin/upload &
#        if [ $? -eq 0 ];then
#                savesc 3 /usr/sbin/upload upload
#        fi

    	nice -n 10 /usr/sbin/$PRGNAME -f /etc/fileserv/lighttpd.conf -m /usr/lib/fileserv
    	if [ $? -eq 0 ];then
		savesc 3 /usr/sbin/$PRGNAME $SRVNAME
    	fi
    	return $?
}
stop() {
#	killproc upload
	killproc $PRGNAME
	killproc fileserv_send
	return $?
}	
restart() {
	stop
	stop
	start
}
# Select
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
  	*)
		echo $"Usage: $0 {start|stop|restart}"
		exit 1
		;;
esac

exit $?

