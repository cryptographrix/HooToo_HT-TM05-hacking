# cryptographrix/HooToo_HT-TM05-hacking

## Summary

This repo contains a basic script that downloads the current firmware for the HooToo HT-TM05 portable router and lets you access and modify everything.

## What this actually does

1. Downloads the firmware zip file from the HooToo download site (ZIP)
2. Unzips that into the actual update file, which is a stub of sh and initrdup.gz (UPDATE)
3. Splits the UPDATE file into start_script.sh and initrdup.gz
4. Gunzips initrdup.gz into initrdup
5. Creates ./mount and...
6. Mounts initrdup into ./mount

## QnA

### Who cares?

Anyone that bought one of these useful portable linux systems and wants to do more with - or customize - it.

### What can you do from here?

Anything you want - eventually you'll need to reverse the process:

1. sync and unmount initrdup
2. gzip initrdup
3. cat start-script.sh initrdup.gz > fw_...
4. zip fw into HooToo....

### And just who are you?....

My name is Michael Renz and I just write random stuff like this...

### Hi, this is HooToo and we'd like you to censor/remove/change....

Email me here: [cryptographrix@gmail.com](mailto:cryptographrix@gmail.com?subject=[HooToo hacking] Just who the hell do you think you are??!?!??)

