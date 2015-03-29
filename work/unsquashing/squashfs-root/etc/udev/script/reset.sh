#!/bin/sh
. /etc/init.d/vstfunc
#global value
export PATH=/bin:/sbin:/usr/bin:/usr/sbin

echo /etc/init.d/resumeorg >> /tmp/reset_info

/etc/init.d/resumeorg

exit

