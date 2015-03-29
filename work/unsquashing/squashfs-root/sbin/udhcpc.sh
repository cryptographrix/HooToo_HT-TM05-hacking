#!/bin/sh
# include 
. /etc/init.d/vstfunc

# udhcpc script edited by Tim Riker <Tim@Rikers.org>

[ -z "$1" ] && echo "Error: should be called from udhcpc" && exit 1

#broadcast = `usr/sbin/get_broadcast_addr $ip $subnet`

RESOLV_CONF="/etc/resolv.conf"
#[ -n "$broadcast" ] && BROADCAST="broadcast $broadcast"
[ -n "$broadcast" ] && BROADCAST="broadcast "`/usr/sbin/get_broadcast_addr $ip $subnet`
[ -n "$subnet" ] && NETMASK="netmask $subnet"

case "$1" in
    deconfig)
        /sbin/ifconfig $interface 0.0.0.0
        ;;

    renew|bound)
        /sbin/ifconfig $interface $ip $BROADCAST $NETMASK

        if [ -n "$router" ] ; then
#            echo "deleting routers"
            while route del default gw 0.0.0.0 dev $interface ; do
                :
            done

            metric=0
            for i in $router ; do
                metric=`expr $metric + 1`
                route add default gw $i dev $interface metric $metric
            done
        fi

#       echo -n > $RESOLV_CONF
	cat /dev/null > $RESOLV_CONF
        [ -n "$domain" ] && echo search $domain >> $RESOLV_CONF
        for i in $dns ; do
#            echo adding dns $i
            echo nameserver $i >> $RESOLV_CONF
        done
	if [ -f /etc/newfunction/staticdns ]; then
        	for i in $dns ; do
			if [ -n $i ]; then
				locknet "config-staticdns.sh $i"
				break
			fi
        	done
#			locknet config-staticdns.sh
	else
		locknet /usr/sbin/tst_nameserver
		killproc udhcpd
		/usr/sbin/udhcpd /etc/udhcpd.conf
	fi
		# notify goahead when the WAN IP has been acquired. --yy
#	killall -SIGTSTP goahead

		# restart igmpproxy daemon
#		config-igmpproxy.sh
	if [ -f /etc/init.d/minidlna.sh ]; then
		/etc/init.d/minidlna.sh renet
	fi
		/etc/init.d/upnpd.sh restart
        ;;
esac

exit 0

