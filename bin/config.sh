#!/bin/bash

cd ..
DIR=$(pwd)

echo -n "Enter your productID: "
read productID
LEN=$(echo ${#productID})

if [ $LEN -lt 36 ]; then
        echo "Invalid productID length, get your productID at maker.bankingofthings.io"
        exit 1
else
       cd $DIR && make config key=productID value=$productID
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
