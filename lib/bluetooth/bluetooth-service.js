const bleno = require('bleno');

const SystemInformationService = require('./system-information-service');
const systemInformationService = new SystemInformationService();

let methods = {};
let blenoPoweredOn = false;

methods.startAdvertising = () => {
    if (blenoPoweredOn) {
        bleno.startAdvertising('BoT Connected device',
            [systemInformationService.uuid]);
    }
};

methods.stopAdvertising = () => {
    bleno.stopAdvertising();
    bleno.disconnect();
};

bleno.on('stateChange', (state) => {
    console.log('Bluetooth: on -> stateChange: ' + state);
    blenoPoweredOn = (state === 'poweredOn');
    methods.startAdvertising();
});

bleno.on('advertisingStart', (error) => {
    const status = error ? 'error ' + error : 'success';
    console.log('Bluetooth: on -> advertisingStart: ' + status);

    if (!error) {
        bleno.setServices([
            systemInformationService
        ]);
    }
});

module.exports = methods;
