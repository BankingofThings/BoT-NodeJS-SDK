const bleno = require('bleno');
const os = require('os');

const BlenoService = require('./bleno/bleno-service');
const Logger = require('./logger');

const blenoService = new BlenoService();
const logger = new Logger('Bluetooth Service');


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
    if (state === 'poweredOn') {
        logger.info('Bluetooth powered on. Starting advertising...');
        bluetoothService.startAdvertising();
    } else {
        logger.info('Bluetooth is powered off. Stopping advertising...');
        bluetoothService.stopAdvertising();
    }
});

bleno.on('advertisingStart', (error) => {
    if (error) {
        logger.error('Failed to start advertising.');
    } else {
        logger.info('Successfully started advertising.');
    }
    if (!error) {
        bleno.setServices([blenoService], (error) => {
            if (error) {
                logger.error('setServices: ' + error);
            } else {
                logger.info('Successfully set services.');
            }
        });
    }
});

module.exports = bluetoothService;
