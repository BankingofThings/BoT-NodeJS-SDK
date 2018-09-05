'use strict';

const bleno = require('bleno');
const qr2png = require('qrcode');
const Utils = require('./utils');
const SystemInformationService = require('./systeminformationservice');

let methods = {};
let blenoPoweredOn = false;
const systemInformationService = new SystemInformationService();

methods.StopAdvertising = function() {
    bleno.stopAdvertising();
    bleno.disconnect();
};

methods.startScan = function() {
    if (blenoPoweredOn === true) {
        bleno.startAdvertising('Bot Connected device',
            [systemInformationService.uuid]);
    }
};

methods.startAdvertising = function() {
    let qrData = JSON.stringify({
        'deviceID': Utils.getDeviceID(),
        'makerID': Utils.getMakerID(),
        'publicKey': Utils.getValueForKey('publicKey'),
    });

    qr2png.toFile('./qr.png', qrData, function(err) {
        if (err) throw err;
    });

    methods.startScan();
};

bleno.on('stateChange', function(state) {
    console.log('Bot: on -> stateChange: ' + state);
    blenoPoweredOn = (state === 'poweredOn');
    methods.startScan();
});

bleno.on('advertisingStart', function(error) {
    const status = error ? 'error ' + error : 'success';
    console.log('Bot: on -> advertisingStart: ' + status);

    if (!error) {
        bleno.setServices([
            systemInformationService,
        ]);
    }
});

module.exports = methods;
