'use strict';

const util = require('util');
const Utils = require('../utils');
const BotConfig = require('../configuration');
const Communication = require('../communication');
const Job = require('events');

const bleno = require('bleno');
const BlenoCharacteristic = bleno.Characteristic;
const BlenoDescriptor = bleno.Descriptor;

let em = new Job.EventEmitter();

function ConfigureCharacteristic() {
    ConfigureCharacteristic.super_.call(this, {
        uuid: '32BEAA1B-D20B-47AC-9385-B243B8071DE4',
        properties: ['read', 'write'],
        descriptors: [
            new BlenoDescriptor({
                uuid: '2901',
                value: 'desc.',
            }),
        ],
    });
}

util.inherits(ConfigureCharacteristic, BlenoCharacteristic);

async function getPairedStatus() {
    let paired = false;
    while (!paired) {
        let makerID = Utils.getMakerID();
        let deviceID = Utils.getDeviceID();
        let response = await Communication.getJSON(
            'pair',
            makerID + '/' + deviceID
        );
        if (response === 'true') {
            console.log('Reloading Config');
            BotConfig.startConfiguration();
            paired = true;
        }
    }
}

em.on('skipWifi', function() {
    getPairedStatus();
});

ConfigureCharacteristic.prototype.onWriteRequest = async function(
    data,
    offset,
    withoutResponse,
    callback
) {
    console.log('FirstCharacteristic - onWriteRequest: value = ' +
        data.toString());

    if (offset) {
        callback(this.RESULT_ATTR_NOT_LONG);
    } else {
        callback(this.RESULT_SUCCESS);
    }

    if (offset > data.length) {
        callback(bleno.Characteristic.RESULT_INVALID_OFFSET);
        console.log('Error, in Characteristic');
    } else {
        callback(bleno.Characteristic.RESULT_SUCCESS, data.slice(offset));
        let details = JSON.parse(data);

        if (details.Skip === true) {
            console.log('Skipping Wifi');
            Utils.setValueForKey('regLvl', 1);

            em.emit('skipWifi', 'Poll');
        } else {
            let wifiDetails = '';
            if (details.SSID !== '') {
                wifiDetails = 'ctrl_interface=DIR=/var/run/wpa_supplicant' +
                    ' GROUP=netdev\r\n update_config=1\r\n country=GB \r\n' +
                    'network={ \r\n        ssid="' + details.SSID + '" \r\n' +
                    '        psk="' + details.PWD + '" \r\n        ' +
                    'key_mgmt=WPA-PSK \r\n}';
            }
            Utils.setValueForKey('regLvl', 1);
            setTimeout(function() {
                let sys = require('sys');
                let exec = require('child_process').exec;

                function puts(error, stdout, stderr) {
                    sys.puts(stdout);
                }

                exec(
                    'sudo echo \'' + wifiDetails + '\' > ./wpa_supplicant.conf',
                    puts
                );
                exec(
                    'sudo cp ./wpa_supplicant.conf /etc/wpa_supplicant/',
                    puts
                );
                exec('sudo rm ./wpa_supplicant.conf', puts);
                exec('sudo sleep 1 && reboot', puts);
                process.exit();
            }, 3000);
        }
    }
};

ConfigureCharacteristic.prototype.onReadRequest = function(offset, callback) {
    if (!offset) {
        this._value = new Buffer(JSON.stringify({
            'BoT': 'Configuration Done',
        }));
    }

    console.log('DeviceCharacteristic - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );

    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};
module.exports = ConfigureCharacteristic;
