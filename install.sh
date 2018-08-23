#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

echo "----------------------------------------"
echo "|     INSTALLING BOT PREREQUISITES     |"
echo "----------------------------------------"

systemctl stop bluetooth
systemctl disable bluetooth

hciconfig hci0 up

apt-get update -qq --yes
apt-get install -qq --yes bluetooth bluez libbluetooth-dev libudev-dev git libcap2-bin

echo "Installing node"
wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v7.7.1.sh | bash

sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

make install

echo "----------------------------------------"
echo "|                 DONE                 |"
echo "----------------------------------------"
