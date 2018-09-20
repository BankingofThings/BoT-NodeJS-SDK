const Store = require('../store');

const bleno = require('bleno');
const os = require('os');
const util = require('util');


const DeviceCharacteristic = function () {
    DeviceCharacteristic.super_.call(this, {
        uuid: 'CAD1B513-2DA4-4609-9908-234C6D1B2A9C',
        properties: ['read']
    });
    this._value = new Buffer(0);
};

DeviceCharacteristic.prototype.onReadRequest = function (offset, callback) {
    if (!offset) {
        console.log(
            'Bluetooth Service:',
            'Read request for Device Characteristics'
        );
        data = {
            'deviceID': Store.getDeviceID(),
            'makerID': Store.getMakerID(),
            'name': os.hostname(),
            'publicKey': Store.getPublicKey()
        };
        this._value = new Buffer(JSON.stringify(data));
    } else {
        console.log(
            'Bluetooth Service:',
            'Device Characteristic read request with offset: ' + offset
        );
    }
    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};

util.inherits(DeviceCharacteristic, bleno.Characteristic);
module.exports = DeviceCharacteristic;
