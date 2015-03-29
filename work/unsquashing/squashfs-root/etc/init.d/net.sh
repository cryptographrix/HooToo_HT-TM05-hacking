mod=`nvram_get OperationMode`
wanmod=`nvram_get wanConnectionMode`
addstaticdns(){
	if [ -f /tmp/newfunction/staticdns ]; then
		cmd=`cat /tmp/newfunction/staticdns`
		$cmd
	fi
}
start(){
        iptables -F PREROUTING -t nat
	touch /tmp/ownhttpstart
        iptables -t nat -A PREROUTING -i br0 -p tcp -d $1 --dport 80 -j ACCEPT
        iptables -t nat -A PREROUTING -i br0 -p tcp --dport 80 -j REDIRECT --to-ports 85
        iptables -t nat -A PREROUTING -i br0 -p udp --dport 53 -j REDIRECT --to-ports 55
}
stop(){
	rm -f /tmp/ownhttpstart
        iptables -F PREROUTING -t nat
#        iptables -t nat -D PREROUTING -i br0 -p tcp -d $1 --dport 80 -j ACCEPT
#        iptables -t nat -D PREROUTING -i br0 -p tcp --dport 80 -j REDIRECT --to-ports 85
#        iptables -t nat -D PREROUTING -i br0 -p udp --dport 53 -j REDIRECT --to-ports 8081
#iptables -t nat -D PREROUTING 1
#iptables -t nat -D PREROUTING 1
#iptables -t nat -D PREROUTING 1

}
reset(){
    stop 
    start $1
}


case "$1" in
    start)
        if [ -z $2 ]; then
            localip=`nvram_get lan_ipaddr`
        else
            localip=$2
        fi
        start $localip
        nice -n 19 owndns 55 
        nice -n 19 ownhttp 85 $localip
	addstaticdns
        ;;
    stop)
        killall -KILL owndns
        killall -KILL ownhttp
        sleep 2
        stop
	addstaticdns
        ;;
    reset)
        if [ -z $2 ]; then
            localip=`nvram_get lan_ipaddr`
        else
            localip=$2
        fi
        reset $localip
	addstaticdns
        ;;
    *)
        echo $"Usage: $0 {start|stop}"
        exit 1
        ;;
esac

