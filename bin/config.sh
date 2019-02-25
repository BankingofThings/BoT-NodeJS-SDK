#!/bin/bash

cd ..
DIR=$(pwd)

echo -n "Enter your makerID: " 
read makerID
LEN=$(echo ${#makerID})

if [ $LEN -lt 36 ]; then
        echo "Invalid makerID length, get your makerID at maker.bankingofthings.io"
        exit 1
else
       cd $DIR && make config key=makerID value=$makerID
fi


read -p "Are you building a multi pairable device? [no/yes]: "  multipair
multipair=${multipair:-no}

echo $multipair

if [ "${multipair}" == "yes" ] ; then
	echo -n "Enter your alternativeID: " 
	read alternativeID
	cd $DIR && make config key=multipair value=multipair
	cd $DIR && make config key=aid value=$alternativeID
fi

echo Setup complete.