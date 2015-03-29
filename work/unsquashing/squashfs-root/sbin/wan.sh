#!/bin/sh
#
# $Id: wan.sh,v 1.21 2010-03-10 13:48:06 chhung Exp $
#
# usage: wan.sh
#

. /sbin/global.sh
. /etc/init.d/vstfunc

# stop all
#killall -q syslogd
killproc udhcpc
#usbdongled will not start after kill it
#killproc usbdongled
killproc  pppd
killproc pppoecd
#killall -q l2tpd
#killall -q openl2tpd


#clone_en=`nvram_get 2860 macCloneEnabled`
#clone_mac=`nvram_get 2860 macCloneMac`
#MAC Clone: bridge mode doesn't support MAC Clone
#if [ "$opmode" != "0" -a "$clone_en" = "1" ]; then
#	ifconfig $wan_if down
#	if [ "$opmode" = "2" ]; then
#		rmmod rt2860v2_sta_net
#		rmmod rt2860v2_sta
#		rmmod rt2860v2_sta_util
#
#		insmod -q rt2860v2_sta_util
#		insmod -q rt2860v2_sta mac=$clone_mac
#		insmod -q rt2860v2_sta_net
#	else
#		ifconfig $wan_if hw ether $clone_mac
#	fi
#	ifconfig $wan_if up
#fi

if [ "$wanmode" = "STATIC" -o "$opmode" = "0" ]; then
	#always treat bridge mode having static wan connection
	if [ "$opmode" = "3" ]; then
		ip=`nvram_get 2860 Wireless_wan_ipaddr`
		nm=`nvram_get 2860 Wireless_wan_netmask`
		gw=`nvram_get 2860 Wireless_wan_gateway`
		pd=`nvram_get 2860 Wireless_wan_primary_dns`
		sd=`nvram_get 2860 Wireless_wan_secondary_dns`
		
	else
		ip=`nvram_get 2860 wan_ipaddr`
		nm=`nvram_get 2860 wan_netmask`
		gw=`nvram_get 2860 wan_gateway`
		pd=`nvram_get 2860 wan_primary_dns`
		sd=`nvram_get 2860 wan_secondary_dns`
	fi

	#lan and wan ip should not be the same except in bridge mode
	if [ "$opmode" != "0" ]; then
		lan_ip=`nvram_get 2860 lan_ipaddr`
		if [ "$ip" = "$lan_ip" ]; then
			echo "wan.sh: warning: WAN's IP address is set identical to LAN"
			exit 0
		fi
	else
		#use lan's ip address instead
		ip=`nvram_get 2860 lan_ipaddr`
		nm=`nvram_get 2860 lan_netmask`
	fi
	BROADCAST="broadcast "`/usr/sbin/get_broadcast_addr $ip $nm`
	ifconfig $wan_if $ip netmask $nm $BROADCAST
	route del default
	if [ "$gw" != "" ]; then
	route add default gw $gw
	fi
	config-dns.sh $pd $sd
	if [ "$1" != "b" ]; then 
		if [ -n $pd ]; then
			config-staticdns.sh "$pd"
		elif [ -n $sd ]; then
			config-staticdns.sh "$sd"
		fi
	fi

elif [ "$wanmode" = "DHCP" ]; then
	hn=`nvram_get 2860 wan_dhcp_hn`
	if [ "$hn" != "" ]; then
		udhcpc -i $wan_if -h $hn -s /sbin/udhcpc.sh -p /var/run/udhcpc.pid &
	else
		udhcpc -i $wan_if -s /sbin/udhcpc.sh -p /var/run/udhcpc.pid &
	fi
#elif [ "$wanmode" = "PPPOE" ]; then
	#u=`nvram_get 2860 wan_pppoe_user`
	#pw=`nvram_get 2860 wan_pppoe_pass`
	#pppoe_opmode=`nvram_get 2860 wan_pppoe_opmode`
	#if [ "$pppoe_opmode" = "" ]; then
#		echo "pppoecd $wan_if -u $u -p $pw"
#		pppoecd $wan_if -u "$u" -p "$pw"
elif [ "$wanmode" = "PPPOE" ];then
	srvname=`nvram_get 2860 servername`
	if [ "$srvname" != ""];then
		pppoe_client

	else
		pppoe_optime=`nvram_get 2860 wan_pppoe_optime`
		u=`nvram_get 2860 wan_pppoe_user`
		pw=`nvram_get 2860 wan_pppoe_pass`
		pppoe_opmode=`nvram_get 2860 wan_pppoe_opmode`
		/sbin/config-pppoe.sh $u $pw $wan_if $pppoe_opmode $pppoe_optime

	fi
#elif [ "$wanmode" = "L2TP" ]; then
#	srv=`nvram_get 2860 wan_l2tp_server`
#	u=`nvram_get 2860 wan_l2tp_user`
#	pw=`nvram_get 2860 wan_l2tp_pass`
#	mode=`nvram_get 2860 wan_l2tp_mode`
#	l2tp_opmode=`nvram_get 2860 wan_l2tp_opmode`
#	l2tp_optime=`nvram_get 2860 wan_l2tp_optime`
#	if [ "$mode" = "0" ]; then
#		ip=`nvram_get 2860 wan_l2tp_ip`
#		nm=`nvram_get 2860 wan_l2tp_netmask`
#		gw=`nvram_get 2860 wan_l2tp_gateway`
#		if [ "$gw" = "" ]; then
#			gw="0.0.0.0"
#		fi
#		config-l2tp.sh static $wan_if $ip $nm $gw $srv $u $pw $l2tp_opmode $l2tp_optime
#	else
#		config-l2tp.sh dhcp $wan_if $srv $u $pw $l2tp_opmode $l2tp_optime
#	fi
#elif [ "$wanmode" = "PPTP" ]; then
#	srv=`nvram_get 2860 wan_pptp_server`
#	u=`nvram_get 2860 wan_pptp_user`
#	pw=`nvram_get 2860 wan_pptp_pass`
#	mode=`nvram_get 2860 wan_pptp_mode`
#	pptp_opmode=`nvram_get 2860 wan_pptp_opmode`
#	pptp_optime=`nvram_get 2860 wan_pptp_optime`
#	if [ "$mode" = "0" ]; then
#		ip=`nvram_get 2860 wan_pptp_ip`
#		nm=`nvram_get 2860 wan_pptp_netmask`
#		gw=`nvram_get 2860 wan_pptp_gateway`
#		if [ "$gw" = "" ]; then
#			gw="0.0.0.0"
#		fi
#		config-pptp.sh static $wan_if $ip $nm $gw $srv $u $pw $pptp_opmode $pptp_optime
#	else
#		config-pptp.sh dhcp $wan_if $srv $u $pw $pptp_opmode $pptp_optime
#	fi
elif [ "$wanmode" = "3G" ]; then
	usbdongled &
else
	echo "wan.sh: unknown wan connection type: $wanmode"
	exit 1
fi
touch /tmp/p2p_netchange_flag
