#!/bin/sh
. /etc/init.d/vstfunc
#global value
export PATH=/bin:/sbin:/usr/bin:/usr/sbin

echo /usr/shutdown h >> /tmp/power_info


/sbin/shutdown h

exit

