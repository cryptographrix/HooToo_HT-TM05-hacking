#!/bin/sh
while true; do
	if [ -e /tmp/net_initing ]; then 
		continue
	fi
	nvram_set OperationMode 1
	netinit.sh
	break
done
