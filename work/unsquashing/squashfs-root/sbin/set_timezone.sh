#!/bin/sh
TZ_VAL="GMT-8:00"
[ -n "$1" ] && TZ_VAL="$1"
DAYLIGHT=V$2                # yes or no

usage(){
cat << LJD
Usage: $0   <timezone>   <daylight[yes/no]>.
Version 0.2
eg1. $0 "GMT-8:00" yes
eg2. $0       #Use default timezone GMT-8:00,daylight=no.
LJD
}

daylight(){
    timezone="$1"
    symbol=$(echo  $timezone | cut -c 4)
    hour=$(echo  $timezone | cut -d $symbol -f 2 | cut -d : -f 1)
    minute=$(echo $timezone | cut -d : -f 2)

    if [ $symbol = "-" ] ; then
        hour=`expr $hour + 1`
    elif [ $symbol = "+" ] ; then
        hour=`expr $hour - 1`
    fi
    timezone=GMT$symbol$hour:$minute
    echo "$timezone"
}
set_time_zome(){
    TZ="$1"
    [ -n "$TZ" ] && echo "$TZ"  > /etc/TZ
    return "$?"
}

check_timezone(){
    TIMEZONE=$1
    echo "$TIMEZONE" | grep ^GMT[-+][0-9][0-9]:[0-9][0-9] -q
    flag1="$?"
    echo "$TIMEZONE" | grep ^GMT[-+][0-9]:[0-9][0-9] -q
    flag2="$?"
    if [ "$flag1" = "0" ] || [ "$flag2" = "0" ] ; then
        flag=pass
    else
        flag=nopass
    fi
    echo  "$flag" 
}

    
if [  "$(check_timezone "$TZ_VAL")" = "pass" ];then
    if [ "$DAYLIGHT" = "Vyes" ] ; then
         TZ_VAL="$(daylight $TZ_VAL)"
    fi
    set_time_zome  "$TZ_VAL"                
else
    echo "It have error that parameter format of timezone."
    usage	
fi



