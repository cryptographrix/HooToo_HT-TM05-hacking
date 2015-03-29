#! /bin/sh
# description: Starts and stops the upnpdevd  manager daemons \
#              used to provide web manager services.
#
# pidfile: /var/run/upnpd.pid

# Const
PRGNAME=upnpd
SRVNAME=upnpd
# Source function library.
. /etc/init.d/vstfunc
# Function
start() {
        #check pid file
        checkonly $PRGNAME
	if [ $? -eq 0 ];then
	    exit 0
	fi
	/usr/sbin/$PRGNAME &
        if [ $? -eq 0 ];then
		savesc 3 /usr/sbin/$PRGNAME $SRVNAME
        fi
	return $?
}

stop() {
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
        	start
		if [ -f /etc/init.d/control.sh ]; then
			/etc/init.d/control.sh restart
		fi
        ;;
  	stop)
        	stop
        ;;
  	restart)
        	restart
		if [ -f /etc/init.d/control.sh ]; then
			/etc/init.d/control.sh restart
		fi
        ;;
  	*)
        	echo $"Usage: $0 {start|stop|restart}"
        	exit 1
	;;
esac

exit $?
