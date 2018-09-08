const Store = require('../store');

const bleno = require('bleno');
const os = require('os');
const util = require('util');


function DeviceCharacteristic () {
    DeviceCharacteristic.super_.call(this, {
        uuid: 'CAD1B513-2DA4-4609-9908-234C6D1B2A9C',
        properties: ['read']
    });
    this._value = new Buffer(0);
}

util.inherits(DeviceCharacteristic, bleno.Characteristic);

DeviceCharacteristic.prototype.onReadRequest = (offset, callback) => {
    if (!offset) {
        this._value = new Buffer(JSON.stringify({
            'botid': Store.getDeviceID(),
            'makerid': Store.getMakerID(),
            'name': os.hostname(),
            'publicKey': Store.getPublicKey()
        }));
    }
    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};

module.exports = DeviceCharacteristic;