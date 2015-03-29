#!/bin/sh
# description: Starts and stops the Samba smbd and nmbd daemons \
#	       used to provide SMB network services.
#
# pidfile: /var/run/smbd.pid
# config:  /etc/samba/smb.conf

# Const
ret=0
BIN_DIR=/usr/sbin
# Source function library.
. /etc/init.d/vstfunc
# Check that smb.conf exists.
if [ ! -e /etc/samba/smb.conf ]; then
        $BIN_DIR/update_smb /etc/samba/smb.conf
fi

# Function
start() {
    	#check
        check_usb_flag
        if [ $? -ne 0 ];then
                exit 0
        fi
    	checkonly "smbd"
    	if [ $? -eq 0 ];then
        	exit 0
    	fi
	while [ -f /var/run/update_smb.pid ]; do
		sleep 2
	done
        # update samba config
	touch /var/run/update_smb.pid
        update_smb /etc/samba/smb.conf
	rm -rf /var/run/update_smb.pid
    	# Mount tmpfs for samba
    	nice -n 10 $BIN_DIR/smbd -D -s/etc/samba/smb.conf -d0
    	smbdret=$?
    	nice -n 10 $BIN_DIR/nmbd -D -s/etc/samba/smb.conf -d0
    	nmbdret=$?
    	if [ $smbdret -eq 0 -a $nmbdret -eq 0 ]; then
                savesc 3 $BIN_DIR/smbd smbd
                savesc 3 $BIN_DIR/nmbd nmbd
    	fi
    	return $?
}
stop() {
	killproc smbd
	killproc nmbd
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
