const bleno = require('bleno');
const os = require('os');
const util = require('util');


const DeviceInfoCharacteristic = function () {
    DeviceInfoCharacteristic.super_.call(this, {
        uuid: 'CD1B3A04-FA33-41AA-A25B-8BEB2D3BEF4E',
        properties: ['read']
    });
    this._value = new Buffer(0);
};

DeviceInfoCharacteristic.prototype.onReadRequest = function (offset, callback) {
    if (!offset) {
        console.log(
            'Bluetooth Service:',
            'Read request for Device Info'
        );
        this._value = new Buffer(JSON.stringify({
            'platform': os.platform(),
            'release': os.release(),
            'type': os.type(),
            'arch': os.arch(),
            'cpus': JSON.stringify(os.cpus().length),
            'hostname': os.hostname(),
            'endianness': os.endianness(),
            'totalMemory': JSON.stringify(os.totalmem())
        }));
    } else {
        console.log(
            'Bluetooth Service:',
            'Device Info read request with offset: ' + offset
        );
    }

    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};

util.inherits(DeviceInfoCharacteristic, bleno.Characteristic);
module.exports = DeviceInfoCharacteristic;
