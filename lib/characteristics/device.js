'use strict';

const bleno = require('bleno');
const os = require('os');
const util = require('util');
const Utils = require('../utils');

var BlenoCharacteristic = bleno.Characteristic;
var DeviceCharacteristic = function () {
    DeviceCharacteristic.super_.call(this, {
        uuid: 'CAD1B513-2DA4-4609-9908-234C6D1B2A9C',
        properties: ['read'],
    });

    this._value = new Buffer(0);
};

DeviceCharacteristic.prototype.onReadRequest = function (offset, callback) {
    if (!offset) {
        this._value = new Buffer(JSON.stringify({
            'botid': Utils.getValueForKey('botID'),
            'makerid': Utils.getMakerID(),
            'name': os.hostname(),
            'publicKey': Utils.getValueForKey('publicKey'),
        }));
    }
    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};

util.inherits(DeviceCharacteristic, BlenoCharacteristic);
module.exports = DeviceCharacteristic;
