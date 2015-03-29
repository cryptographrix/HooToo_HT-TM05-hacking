#!/bin/sh
#
# $Id: internet.sh,v 1.124.2.1 2011-07-07 03:43:38 michael Exp $
#
# usage: internet.sh
#
product=`cat /etc/upnp/upnpd.conf | grep product_line | cut -d= -f2`
if [ $product == "rlwifiport" ]; then
	if [ -e /proc/vsnetswitch ]; then
        	status=`cat /proc/vsnetswitch`
        	echo status=$status
        	if [ $status -eq 0 ];then
                	#echo OK
                	opmode_set 1
        	elif [ $status -eq 1 ];then
                	opmode_set 3
        	fi
	fi
fi
. /sbin/config.sh
. /sbin/global.sh

#lan_ip=`nvram_get 2860 lan_ipaddr`
#stp_en=`nvram_get 2860 stpEnabled`
#nat_en=`nvram_get 2860 natEnabled`
#radio_off=`nvram_get 2860 RadioOff`
#wifi_off=`nvram_get 2860 WiFiOff`
#ra_Bssidnum=`nvram_get 2860 BssidNum`
#rai_Bssidnum=`nvram_get rtdev BssidNum`

set_vlan_map()
{
	# vlan priority tag => skb->priority mapping
	vconfig set_ingress_map $1 0 0
	vconfig set_ingress_map $1 1 1
	vconfig set_ingress_map $1 2 2
	vconfig set_ingress_map $1 3 3
	vconfig set_ingress_map $1 4 4
	vconfig set_ingress_map $1 5 5
	vconfig set_ingress_map $1 6 6
	vconfig set_ingress_map $1 7 7

	# skb->priority => vlan priority tag mapping
	vconfig set_egress_map $1 0 0
	vconfig set_egress_map $1 1 1
	vconfig set_egress_map $1 2 2
	vconfig set_egress_map $1 3 3
	vconfig set_egress_map $1 4 4
	vconfig set_egress_map $1 5 5
	vconfig set_egress_map $1 6 6
	vconfig set_egress_map $1 7 7
}

ifRaxWdsxDown()
{
	num=15
	while [ "$num" -gt 0 ]
	do
		num=`expr $num - 1`
		ifconfig ra$num down 1>/dev/null 2>&1
	done

	ifconfig wds0 down 1>/dev/null 2>&1
	ifconfig wds1 down 1>/dev/null 2>&1
	ifconfig wds2 down 1>/dev/null 2>&1
	ifconfig wds3 down 1>/dev/null 2>&1

	ifconfig apcli0 down 1>/dev/null 2>&1

	ifconfig mesh0 down 1>/dev/null 2>&1
	echo -e "\n##### disable 1st wireless interface #####"
}

ifRaixWdsxDown()
{
	num=15
	while [ "$num" -gt 0 ]
	do
		num=`expr $num - 1`
		ifconfig rai$num down 1>/dev/null 2>&1
	done

	ifconfig wdsi0 down 1>/dev/null 2>&1
	ifconfig wdsi1 down 1>/dev/null 2>&1
	ifconfig wdsi2 down 1>/dev/null 2>&1
	ifconfig wdsi3 down 1>/dev/null 2>&1
	echo -e "\n##### disable 2nd wireless interface #####"
}

addBr0()
{
	brctl addbr br0
	brctl addif br0 ra0
	if [ "$ra_Bssidnum" = "2" ]; then
		ifconfig ra1 0.0.0.0 1>/dev/null 2>&1
		brctl addif br0 ra1
	fi 
	#brctl addif br0 eth2
	brctl setfd br0 1
	brctl stp br0 0
}

enableIPv6dad()
{
	if [ "$CONFIG_IPV6" == "y" -o "$CONFIG_IPV6" == "m" ]; then
		echo "2" > /proc/sys/net/ipv6/conf/$1/accept_dad
		echo $2 > /proc/sys/net/ipv6/conf/$1/dad_transmits
	fi
}

disableIPv6dad()
{
	if [ "$CONFIG_IPV6" == "y" -o "$CONFIG_IPV6" == "m" ]; then
		echo "0" > /proc/sys/net/ipv6/conf/$1/accept_dad
	fi
}

genSysFiles()
{
	#login=`nvram_get 2860 Login`
	#pass=`nvram_get 2860 Password`
	#if [ "$login" != "" -a "$pass" != "" ]; then
	#echo "$login::0:0:Adminstrator:/:/bin/sh" > /etc/passwd
	#echo "$login:x:0:$login" > /etc/group
	#	chpasswd.sh $login $pass
	#fi
	if [ "$CONFIG_PPPOL2TP" == "y" ]; then
	echo "l2tp 1701/tcp l2f" > /etc/services
	echo "l2tp 1701/udp l2f" >> /etc/services
	fi
}

echo 1 > /proc/sys/vm/drop_caches
genSysFiles

if [ "$opmode" != "0" ]; then
	echo 1 > /proc/sys/net/ipv4/ip_forward
else
	echo 0 > /proc/sys/net/ipv4/ip_forward
fi

# disable ipv6 DAD on all interfaces by default
#if [ "$CONFIG_IPV6" == "y" -o "$CONFIG_IPV6" == "m" ]; then
#	echo "0" > /proc/sys/net/ipv6/conf/default/accept_dad
#fi

# avoid eth2 doing ipv6 DAD
#disableIPv6dad eth2
ifconfig eth2 0.0.0.0


#ralink_init make_wireless_config rt2860


#vpn-passthru.sh

# config interface
#ifconfig apcli0 down
#ifconfig ra0 down
ra_Bssidnum=`nvram_get 2860 BssidNum`
if [ "$ra_Bssidnum" = "2" ]; then
	ifconfig ra1 down
fi 

ifconfig ra0 0.0.0.0 1>/dev/null 2>&1

#if [ "$radio_off" = "1" ]; then
#	iwpriv ra0 set RadioOn=0
#fi


ifconfig lo 127.0.0.1
ifconfig br0 down
brctl delbr br0

# stop all
iptables --flush
iptables --flush -t nat
#iptables --flush -t mangle
#ifconfig ra0 down

if [ "$CONFIG_RAETH_ROUTER" = "y" -o "$CONFIG_MAC_TO_MAC_MODE" = "y" -o "$CONFIG_RT_3052_ESW" = "y" ]; then
	vconfig rem eth2.1
	vconfig rem eth2.2
	vconfig add eth2 1
	set_vlan_map eth2.1
	vconfig add eth2 2
	set_vlan_map eth2.2
	ifconfig eth2.2 down
	wan_mac=`nvram_get 2860 WAN_MAC_ADDR`
	if [ "$wan_mac" != "FF:FF:FF:FF:FF:FF" ]; then
	ifconfig eth2.2 hw ether $wan_mac
	fi
	#enableIPv6dad eth2.2 1
fi
ifconfig eth2.1 0.0.0.0
ifconfig eth2.2 0.0.0.0
#
# init ip address to all interfaces for different OperationMode:
#   0 = Bridge Mode
#   1 = Gateway Mode
#   2 = Ethernet Converter Mode
#   3 = AP Client
#
if [ "$opmode" = "0" ]; then
	addBr0
	echo "##### restore Ralink ESW to dump switch #####"

	config-vlan.sh 3 0 
	brctl addif br0 eth2
#	APCLI=`nvram_get 2860 apClient`
#	if [ "$CONFIG_RT2860V2_AP_APCLI" = "y" -a "$APCLI" = "1" ]; then
#		ifconfig apcli0 up
#		brctl addif br0 apcli0
#	fi
	if [ "$1" = "b" ]; then
		wan.sh b&
	else
		wan.sh
	fi
#	wan.sh &
	if [ "$1" = "b" ]; then
		lan.sh &
	else
		lan.sh
	fi
#	lan.sh &
#add this to alloc an ipaddr to br0,make br0 as an wan port
#so our device can access the web	
	udhcpc -i br0 -s /sbin/udhcpc.sh -p /var/run/udcpd.pid&
#elif [ "$opmode" = "1" ]; then
elif [ "$opmode" = "1" ]; then
	ifconfig apcli0 0.0.0.0
    ifconfig apcli0 down
	config-vlan.sh 3 LLLLW
	addBr0
	brctl addif br0 eth2.1
	lan.sh #lan.sh&-->lan.sh:udhcpd.conf may be wrong
#	ifconfig ra0 up
	if [ "$1" = "b" ]; then
		wan.sh b&
	else
		wan.sh
	fi
#	wan.sh &
	nat.sh
elif [ "$opmode" = "3" ]; then
	config-vlan.sh 3 0
	
	addBr0
	addRax2Br0
#	brctl addif br0 eth2
if [ ! -f /etc/newfunction/autochange ]; then
	ifconfig eth2.2 down
	ifconfig eth2 down
fi
	lan.sh 
#	ifconfig ra0 up
	if [ "$1" = "b" ]; then
		wan.sh &
	else
		wan.sh
	fi
#	wan.sh &
	nat.sh
else
	echo "unknown OperationMode: $opmode"
	exit 1
fi

# in order to use broadcast IP address in L2 management daemon

	route add -host 255.255.255.255 dev $lan_if
# up ra0 
#ifconfig ra0 up


#/sbin/config-powersave.sh ethernet 1 0
#/sbin/config-powersave.sh ethernet 1 1
#/sbin/config-powersave.sh ethernet 1 2
#/sbin/config-powersave.sh ethernet 1 3
echo 1 > /proc/sys/vm/drop_caches
#iwpriv ra0 e2p 36=1024
#m2uenabled=`nvram_get 2860 M2UEnabled`
#if [ "$m2uenabled" = "1" ]; then
#	iwpriv ra0 set IgmpSnEnable=1
#	echo "iwpriv ra0 set IgmpSnEnable=1"
#fi

#if [ "$wifi_off" = "1" ]; then
#	ifconfig ra0 down
#	reg s b0180000
#	reg w 400 0x1080
#	reg w 1204 8
#	reg w 1004 3
#fi

