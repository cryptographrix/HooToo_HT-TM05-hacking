#!/bin/sh
LNWEB="/etc/www"
if [ -z $1 ]; then
	echo usage: webpath
fi
if [ ! -d $1 ]; then
	echo $1 is not web
fi
if [ -d $LNWEB ]; then
	rm -rf $LNWEB
	if [ -d $LNWEB ]; then
		echo setweb failed: can not remove $LNWEB
		exit 0
	fi
fi
rm -rf $LNWEB
ln -s $1 $LNWEB
if [ -d $LNWEB ]; then
	/etc/init.d/etcsync
	echo setweb ok: $1
else
	echo setweb failed: can not ln $1
fi

