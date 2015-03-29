#! /bin/sh
# Const
PIDPATH=/var/run
PRGNAME=led_control
SRVNAME=led_control
# Source function library.
. /etc/init.d/vstfunc

# Function
start() {
    	#check
    	checkonly $PRGNAME
    	if [ $? -eq 0 ]; then
        	exit 0
    	fi
	rm /var/run/netswitch.pid
#	if [ -e /data/UsbDisk1/Volume1/ ]; then
#		mkdir -p /data/UsbDisk1/Volume1/.vst/upload
#		mkdir -p /data/UsbDisk1/Volume1/.vst/tmp	
#	fi
#	if [ ! -f /data/UsbDisk1/Volume2/.vst/tmp ]; then
#		mkdir -p /data/UsbDisk1/Volume2/.vst/tmp
#	fi

#	nice -n 10 /usr/sbin/upload &
#        if [ $? -eq 0 ];then
#                savesc 3 /usr/sbin/upload upload
#        fi
	/usr/sbin/$PRGNAME
    	if [ $? -eq 0 ];then
		savesc 3 /usr/sbin/$PRGNAME $SRVNAME
    	fi
    	return $?
}
stop() {
#	killproc upload
	killproc $PRGNAME
	return $?
}	
restart() {
	stop
	start
}
# Select
case "$1" in
  	start)
		touch /etc/newfunction/autologin
		restart
		;;
  	stop)
		rm -f /etc/newfunction/autologin
		stop
		locknet "/etc/init.d/net.sh stop"
		start
		;;
  	*)
		echo $"Usage: $0 {start|stop|restart}"
		exit 1
		;;
esac

exit $?

