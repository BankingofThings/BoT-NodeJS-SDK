const bleno = require('bleno');

const SystemInformationService = require('./system-information-service');
const systemInformationService = new SystemInformationService();

const methods = {};

let active = false;

methods.initialize = () => {
    active = true;
};

methods.startAdvertising = () => {
    if (active && bleno.state === 'poweredOn') {
        bleno.startAdvertising(
            'BoT Connected device',
            [systemInformationService.uuid]
        );
    }
};

methods.stopAdvertising = () => {
    bleno.stopAdvertising();
    bleno.disconnect();
};

bleno.on('stateChange', (state) => {
    log('stateChange', state);
    state === 'poweredOn'
        ? methods.startAdvertising()
        : methods.stopAdvertising();
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

module.exports = methods;
