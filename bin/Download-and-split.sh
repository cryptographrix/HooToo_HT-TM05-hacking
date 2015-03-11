#!/bin/bash

WD=`pwd`
MOUNTDIR=${WD}/mount

# List of filenames that are important
#
# ZIP_FILENAME is the name of the zipfile we download from hootoo
# UPDATE_FILENAME is the name of the update file we get from the zip file
ZIP_FILENAME="HooToo-HT-TM05-2.000.022.zip"
UPDATE_FILENAME="fw-7620-WiFiDGRJ-HooToo-HT-TM05-2.000.022"

UPDATE_URL="http://www.hootoo.com/media/downloads/${ZIP_FILENAME}"

# Need to get and unzip the ZIP file
wget -O ./${ZIP_FILENAME} ${UPDATE_URL}
unzip ./${ZIP_FILENAME}

# resulting UPDATE file is a stubfile, so we need to split it
# this gets where the stub ends and the initrdup begins
SPLITLINE=`awk '/^END_OF_STUB/ { print NR + 1; exit 0; }' ${UPDATE_FILENAME}`

# Use the resulting line number to make initrdup.gz and gunzip it
tail -n +${SPLITLINE} ${UPDATE_FILENAME} > initrdup.gz
gunzip initrdup.gz

# Do the same thing for the script at the beginning
head -n $(( ${SPLITLINE} - 1 )) ${UPDATE_FILENAME} > start_script.sh

# mount it somewhere we can work on it
mkdir ${MOUNTDIR}
mount -o loop -t ext2 initrdup ${MOUNTDIR}

