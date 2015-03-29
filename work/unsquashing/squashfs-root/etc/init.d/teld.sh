#!/bin/sh
# description: Starts and stops the telnetd daemons \
#	       used to provide telnetd services.
#
# pidfile: /var/run/teld.pid

# Const
PRGNAME=telnetd
SRVNAME=telnet
# Source function library.
. /etc/init.d/vstfunc
# Function
start() {
    	#check program
    	checkonly $PRGNAME
    	if [ $? -eq 0 ];then
        	exit 0
    	fi
    	/usr/sbin/$PRGNAME
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
