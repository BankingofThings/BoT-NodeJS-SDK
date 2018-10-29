const bleno = require('bleno');
const util = require('util');

const DeviceCharacteristic = require('./device');
const DeviceInfoCharacteristic = require('./device-info');
const DeviceNetworkCharacteristic = require('./device-network');
const ConfigureCharacteristic = require('./configure');


function BlenoService () {
    BlenoService.super_.call(this, {
        uuid: '729BE9C4-3C61-4EFB-884F-B310B6FFFFD1',
        characteristics: [
            new DeviceCharacteristic(),
            new DeviceInfoCharacteristic(),
            new DeviceNetworkCharacteristic(),
            new ConfigureCharacteristic()
        ]
    });
}

util.inherits(BlenoService, bleno.PrimaryService);
module.exports = BlenoService;
