#!/bin/sh
rm -f /tmp/newfunction/staticdns
if [ -f /tmp/ownhttpstart ]; then
	/etc/init.d/net.sh reset
else
	iptables -F PREROUTING -t nat
fi
lan_ip=`nvram_get 2860 lan_ipaddr`
if [ -n "$1" ]; then
	iptables -t nat -A PREROUTING -d $lan_ip -p udp -m udp --dport 53 -j DNAT --to-destination $1:53
	echo "iptables -t nat -A PREROUTING -d $lan_ip -p udp -m udp --dport 53 -j DNAT --to-destination $1:53" > /tmp/newfunction/staticdns
    echo $1 > /tmp/newfunction/iptabledns

else
while read line;do
	pd=`echo $line | grep nameserver |awk -F ' ' '{printf $2}'`
	if [ -n $pd ]; then
		break
	fi
done < /etc/resolv.conf

if [ -n $pd ]; then
    iptables -t nat -A PREROUTING -d $lan_ip -p udp -m udp --dport 53 -j DNAT --to-destination $pd:53
    echo "iptables -t nat -A PREROUTING -d $lan_ip -p udp -m udp --dport 53 -j DNAT --to-destination $pd:53" > /tmp/newfunction/staticdns
    echo $pd > /tmp/newfunction/iptabledns
fi
fi
