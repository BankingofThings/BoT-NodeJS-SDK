const bleno = require('bleno');
const qr2png = require('qrcode');
const Store = require('./store');
const SystemInformationService = require('./systeminformationservice');

let methods = {};
let blenoPoweredOn = false;
const systemInformationService = new SystemInformationService();

methods.StopAdvertising = () => {
    bleno.stopAdvertising();
    bleno.disconnect();
};

methods.startScan = () => {
    if (blenoPoweredOn) {
        bleno.startAdvertising('Bot Connected device',
            [systemInformationService.uuid]);
    }
};

methods.startAdvertising = () => {
    let qrData = JSON.stringify({
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'publicKey': Store.getPublicKey()
    });

    qr2png.toFile('./qr.png', qrData, (err) => {
        if (err) throw err;
    });

    methods.startScan();
};

bleno.on('stateChange', (state) => {
    console.log('Bot: on -> stateChange: ' + state);
    blenoPoweredOn = (state === 'poweredOn');
    methods.startScan();
});

bleno.on('advertisingStart', (error) => {
    const status = error ? 'error ' + error : 'success';
    console.log('Bot: on -> advertisingStart: ' + status);

    if (!error) {
        bleno.setServices([
            systemInformationService
        ]);
    }
});

module.exports = methods;
