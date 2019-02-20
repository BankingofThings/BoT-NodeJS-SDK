#!/bin/bash
OUTPUT="/tmp/input.txt"
>$OUTPUT
trap "rm $OUTPUT; exit" SIGHUP SIGINT SIGTERM
TITLE="FINN - Banking of Things"
SUBTITLE="Configure SDK"
MULTIPAIR=0
cd ..
DIR=$(pwd)
echo $DIR

dialog --title "$TITLE" --backtitle "$SUBTITLE" --inputbox "Enter your makerID " 8 60 2>$OUTPUT
respose=$?	
makerID=$(<$OUTPUT)
cd $DIR && make config key=makerID value=$makerID


dialog --title "$TITLE" --backtitle "$SUBTITLE" --yesno "Are you building a multi pairable device?" 8 60 2>$OUTPUT
response=$?
case $response in
   0) MULTIPAIR=1;;
   1) MULTIPAIR=0;;
   255) echo "[ESC] key pressed.";;
esac

if [ "$MULTIPAIR" -gt 0 ]
then
	dialog --title "$TITLE" --backtitle "$SUBTITLE" --inputbox "Enter your alternativeID name " 8 60 2>$OUTPUT
	respose=$?	
	displayname=$(<$OUTPUT)
	pwd
	cd $DIR && make config key=multipair value=multipair 
	pwd
	cd $DIR && make config key=aid value=$displayname 
fi
