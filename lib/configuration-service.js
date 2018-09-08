const ActionService = require('./action-service');
const ActivationService = require('./activation-service');
const DeviceStatus = require('./device-status');
const KeyGenerator = require('./key-generator');
const PairingService = require('./pairing-service');
const Store = require('./store');

const configurationService = {};

configurationService.initialize = () => {
    log('Initialising configuration...');

    log('Generating deviceID...');
    const deviceID = KeyGenerator.generateDeviceID();
    Store.setDeviceID(deviceID);

    log('Generating keyPair...');
    const keyPair = KeyGenerator.generateKeyPair();
    Store.setKeyPair(keyPair);

    log('Generating QR Code...');
    generateAndSaveQRCode();

    Store.setDeviceStatus(DeviceStatus.NEW);
    logSuccess('Configuration successfully initialised');
};

configurationService.resumeConfiguration = () => {
    switch (Store.getDeviceStatus()) {
        case DeviceStatus.NEW:
            PairingService.pair();
            break;
        case DeviceStatus.PAIRED:
            ActivationService.activate();
            break;
        case DeviceStatus.ACTIVE:
            ActionService.getActions();
            break;
    }
};

configurationService.getDeviceInfo = () => {
    return {
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'publicKey': Store.getPublicKey()
    };
};

function generateAndSaveQRCode () {
    const data = JSON.stringify(configurationService.getDeviceInfo());
    Store.saveQRCode(data);
}

function log (message) {
    console.log('Configuration Service:', message);
}

function logSuccess (message) {
    console.log('\x1b[32mConfiguration Service:', message, '\x1b[39m');
}

module.exports = configurationService;
