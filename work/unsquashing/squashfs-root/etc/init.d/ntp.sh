#!/bin/sh
# Const
PIDPATH=/var/run
PRGNAME=ntp
SRVNAME=ntp
# Source function library.
. /etc/init.d/vstfunc
# Check that ntp.conf exists.
if [ ! -f /etc/ntp/ntp.cfg ]; then
	exit 0
fi
. /etc/ntp/ntp.cfg

if [ $switch -eq 0 ]; then
	exit 0
fi

# Function
start() {
    	#check program
    	checkonly $PRGNAME
    	if [ $? -eq 0 ];then
        	exit 0
    	fi
	if [ -f /etc/init.d/setwhite.sh ]; then
		openserver server.joywifi.net &
		if [ -f /etc/init.d/qos-start.sh ]; then
			/etc/init.d/qos-start.sh restart
		fi
	else
    		/usr/sbin/$PRGNAME &
    		if [ $? -eq 0 ];then
			savesc 3 /usr/sbin/$PRGNAME $SRVNAME
    		fi
	fi
    	return $?
}	
stop() {
	killproc $PRGNAME
	killproc ntpclient
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

