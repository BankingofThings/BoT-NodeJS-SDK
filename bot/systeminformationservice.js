var bleno = require('bleno');
var util = require('util');

var DeviceCharacteristic = require('./characteristics/device');
var DeviceInfoCharacteristic = require('./characteristics/deviceinfo');
var DeviceNetworkCharacteristic = require('./characteristics/devicenetwork');
var ConfigureCharacteristic = require('./characteristics/configure');

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
