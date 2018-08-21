const bleno = require('bleno');
const util = require('util');

const DeviceCharacteristic = require('./characteristics/device');
const DeviceInfoCharacteristic = require('./characteristics/deviceinfo');
const DeviceNetworkCharacteristic = require('./characteristics/devicenetwork');
const ConfigureCharacteristic = require('./characteristics/configure');

function SystemInformationService() {
    bleno.PrimaryService.call(this, {
        uuid: '729BE9C4-3C61-4EFB-884F-B310B6FFFFD1',
        characteristics: [
            new DeviceCharacteristic(),
            new DeviceInfoCharacteristic(),
            new DeviceNetworkCharacteristic(),
            new ConfigureCharacteristic(),
        ],
    });
}

util.inherits(SystemInformationService, bleno.PrimaryService);
module.exports = SystemInformationService;
