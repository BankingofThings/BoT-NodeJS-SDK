const Logger = require('../logger');
const Store = require('../store');
const DeviceStatus = require('../device-status');
const bleno = require('bleno');
const os = require('os');
const util = require('util');

const logger = new Logger('Bluetooth Service');

const DeviceCharacteristic = function () {
    DeviceCharacteristic.super_.call(this, {
        uuid: 'CAD1B513-2DA4-4609-9908-234C6D1B2A9C',
        properties: ['read']
    });
    this._value = new Buffer(0);
};

DeviceCharacteristic.prototype.onReadRequest = function (offset, callback) {
    if (!offset) {
        logger.info('Device data being read by connected device.');

        const data = {
            'deviceID': Store.getDeviceID(),
            'makerID': Store.getMakerOrProductID(),
            'name': os.hostname(),
            'publicKey': Store.getPublicKey()
        };
        if (Store.getDeviceStatus() === DeviceStatus.MULTIPAIR) {
            data.multipair = 1;
            data.aid = Store.getAlternativeID();
        }

        logger.info(data);
        this._value = new Buffer(JSON.stringify(data));
    }
    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};

util.inherits(DeviceCharacteristic, bleno.Characteristic);
module.exports = DeviceCharacteristic;
