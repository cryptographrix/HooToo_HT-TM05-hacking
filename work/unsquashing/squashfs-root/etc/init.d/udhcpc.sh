#! /bin/sh
# Const
PRGNAME=udhcpc
SRVNAME=udhcpc
# Source function library.
. /etc/init.d/vstfunc
HNAME=`cat /etc/hostname`

# Function
start() {
        #check pid file
        checkonly $PRGNAME
	if [ $? -eq 0 ];then
	    exit 0
	fi
	/usr/sbin/$PRGNAME -n -q -i eth0 -H $HNAME -s /etc/dhcp/dhcpc.script
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
esac

exit $?
