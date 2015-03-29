#!/bin/sh
# description: Starts and stops the ntp daemons \
#	       used to provide ntp services.
#
# pidfile: /var/run/ntp.pid

# Const
PIDPATH=/var/run
PRGNAME=ntpclient
SRVNAME=ntpclient

# Source function library.
. /etc/init.d/vstfunc
# Check that ntp.conf exists.
[ -f /etc/ntp/ntp.cfg ] || exit 0

# Function
start() {
    	#check program
	PIDEXIST=`ps axj | grep [n]tpclient`
	if [ "$PIDEXIST" == "" ]; then
		TIMESERV=`grep server /etc/ntp/ntp.cfg | awk -F'=' '{print $2}' | awk -F':' '{print $1}'`
		TIMEINTER=`grep time /etc/ntp/ntp.cfg | awk -F'=' '{print $2}'`
		if [ "$TIMESERV" == "" ] || [ "$TIMEINTER" == "" ]; then
			return
		fi
		let TIMEINTER=TIMEINTER*3600
    		/bin/$PRGNAME -s -c 0 -h $TIMESERV -i $TIMEINTER &
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
esac

exit $?
