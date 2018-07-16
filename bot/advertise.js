'use strict';

var bleno = require('bleno');
var SystemInformationService = require('./systeminformationservice');
var systemInformationService = new SystemInformationService();
var blenoPoweredOn = false;
var qrcode = require('qrcode-terminal');
var Utils = require('./utils');

var methods = {};

methods.StopAdvertising = function() {
    bleno.stopAdvertising();
    bleno.disconnect();
};

methods.startScan = function() {
    if (blenoPoweredOn == true) {
        bleno.startAdvertising('Bot Connected device', [systemInformationService.uuid]);
    }
};

methods.startAdvertising = function() {
    let qrData = JSON.stringify({
        'deviceID': Utils.botID(),
        'makerID': Utils.makerID(),
        'publicKey': Utils.getValueForKey('publicKey'),
    });

    qrcode.generate(qrData, {
        small: true,
    });
    methods.startScan();
};

bleno.on('stateChange', function(state) {
    console.log('Bleno: on -> stateChange: ' + state);
    if (state === 'poweredOn') {
        blenoPoweredOn = true;
    } else {
        blenoPoweredOn = false;
    }
    methods.startScan();
});

bleno.on('advertisingStart', function(error) {
    console.log('on -> advertisingStart: ' +
        (error ? 'error ' + error : 'success')
    );

    if (!error) {
        bleno.setServices([
            systemInformationService,
        ]);
    }
});

methods.isBusy = function() {
    return busy;
};


module.exports = methods;
