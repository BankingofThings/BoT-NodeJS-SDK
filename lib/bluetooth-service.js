const bleno = require('bleno');
const os = require('os');

const SystemInformationService = require('./bluetooth/system-information-service');
const systemInformationService = new SystemInformationService();

const bluetoothService = {};

let active = false;

bluetoothService.initialize = () => {
    active = true;
};

bluetoothService.startAdvertising = () => {
    if (active && bleno.state === 'poweredOn') {
        bleno.startAdvertising(
            'BoT Connected device',
            [systemInformationService.uuid]
        );
    }
};

bluetoothService.stopAdvertising = () => {
    bleno.stopAdvertising();
    if (os.platform() !== 'darwin') {
        bleno.disconnect();
    }
};

bleno.on('stateChange', (state) => {
    log('stateChange', state);
    state === 'poweredOn'
        ? bluetoothService.startAdvertising()
        : bluetoothService.stopAdvertising();
});

bleno.on('advertisingStart', (error) => {
    log('advertisingStart', error ? 'error ' + error : 'success');
    if (!error) {
        bleno.setServices([systemInformationService], (error) => {
            log('setServices', error ? 'error: ' + error : 'success');
        });
    }
});

function log (event, message) {
    console.log('Bluetooth Service: on -> ' + event + ': ' + message);
}

module.exports = bluetoothService;
