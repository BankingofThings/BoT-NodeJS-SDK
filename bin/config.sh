#!/bin/bash

cd ..
DIR=$(pwd)

echo -n "Enter your makerID or productID: "
read makerID
LEN=$(echo ${#makerID})

if [ $LEN -lt 36 ]; then
        echo "Invalid ID length, get your makerID or productID at maker.bankingofthings.io"
        exit 1
else
       cd $DIR && make config key=makerID value=$makerID
fi


read -p "Are you building a multi pairable device? [no/yes]: "  multipair
multipair=${multipair:-no}

echo $multipair

if [ "${multipair}" == "no" ] ; then
	cd $DIR && make config key=standalone value=standalone
fi

if [ "${multipair}" == "yes" ] ; then
	echo -n "Enter your alternativeID: "
	read alternativeID
	cd $DIR && make config key=aid value=$alternativeID
	cd $DIR && make config key=multipair value=multipair
fi




echo Setup complete.
