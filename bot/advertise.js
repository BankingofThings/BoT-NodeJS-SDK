'use strict';

var bleno = require('bleno');
var SystemInformationService = require('./systeminformationservice');
var systemInformationService = new SystemInformationService();
var blenoPoweredOn = false;
var qrcode = require('qrcode-terminal');
var qr2png = require('qrcode');
var Utils = require('./utils');

var methods = {};

methods.StopAdvertising = function() {
    bleno.stopAdvertising();
    bleno.disconnect();
};

methods.startScan = function() {
    if (blenoPoweredOn === true) {
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

    qr2png.toFile('./qr.png', qrData, function (err) {
      if (err) throw err;
      //console.log('done') 
})

    methods.startScan();
};

bleno.on('stateChange', function(state) {
    console.log('Bot: on -> stateChange: ' + state);
	blenoPoweredOn = (state === 'poweredOn');
    methods.startScan();
});

bleno.on('advertisingStart', function(error) {
    console.log('Bot: on -> advertisingStart: ' +
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
