const bleno = require('bleno');
const os = require('os');

const BlenoService = require('./bleno/bleno-service');
const blenoService = new BlenoService();

const bluetoothService = {};

let active = false;

bluetoothService.initialize = () => {
    active = true;
};

bluetoothService.startAdvertising = () => {
    if (active && bleno.state === 'poweredOn') {
        bleno.startAdvertising(
            os.hostname(),
            [blenoService.uuid]
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
        bleno.setServices([blenoService], (error) => {
            log('setServices', error ? 'error: ' + error : 'success');
        });
    }
});

function log (event, message) {
    console.log('Bluetooth Service: on -> ' + event + ': ' + message);
}

module.exports = bluetoothService;
