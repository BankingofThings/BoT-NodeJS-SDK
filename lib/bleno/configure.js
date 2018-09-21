const PairingService = require('../pairing-service');

const util = require('util');
const bleno = require('bleno');

const ConfigureCharacteristic = function () {
    ConfigureCharacteristic.super_.call(this, {
        uuid: '32BEAA1B-D20B-47AC-9385-B243B8071DE4',
        properties: ['read', 'write'],
        descriptors: [
            new bleno.Descriptor({
                uuid: '2901',
                value: 'desc.'
            })
        ]
    });
};

ConfigureCharacteristic.prototype.onWriteRequest = async function (
    data,
    offset,
    withoutResponse,
    callback
) {
    console.log(
        'Bluetooth Service:',
        'ConfigureCharacteristic - onWriteRequest: value = ' + data.toString()
    );
    if (offset) {
        callback(this.RESULT_ATTR_NOT_LONG);
    } else {
        callback(this.RESULT_SUCCESS);
    }

    if (offset > data.length) {
        callback(bleno.Characteristic.RESULT_INVALID_OFFSET);
        console.log('Bleno: Error, in Characteristic');
    } else {
        callback(bleno.Characteristic.RESULT_SUCCESS, data.slice(offset));
        let details = JSON.parse(data);

        if (details.Skip === true) {
            console.log('Bleno: Skipping Wifi');
            PairingService.pair();
        } else {
            let wifiDetails = '';
            if (details.SSID !== '') {
                wifiDetails = 'ctrl_interface=DIR=/var/run/wpa_supplicant' +
                    ' GROUP=netdev\r\n update_config=1\r\n country=GB \r\n' +
                    'network={ \r\n        ssid="' + details.SSID + '" \r\n' +
                    '        psk="' + details.PWD + '" \r\n        ' +
                    'key_mgmt=WPA-PSK \r\n}';
            }
            PairingService.pollPairingStatus();
            setTimeout(() => {
                let exec = require('child_process').exec;

                function puts (error, stdout, stderr) {
                    console.log('Bleno: ', stdout);
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

ConfigureCharacteristic.prototype.onReadRequest = function (offset, callback) {
    if (!offset) {
        this._value = new Buffer(JSON.stringify({
            'BoT': 'Configuration Done'
        }));
    }

    console.log(
        'Bluetooth Service:',
        'DeviceCharacteristic - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );

    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};

util.inherits(ConfigureCharacteristic, bleno.Characteristic);
module.exports = ConfigureCharacteristic;
