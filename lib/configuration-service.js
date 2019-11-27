const ActionService = require('./action-service');
const ActivationService = require('./activation-service');
const DeviceStatus = require('./device-status');
const KeyGenerator = require('./key-generator');
const Logger = require('./logger');
const PairingService = require('./pairing-service');
const Store = require('./store');

const logger = new Logger('Configuration Service');
const configurationService = {};

configurationService.initialize = () => {
    logger.info('Initializing configuration...');

    logger.info('Generating deviceID...');
    const deviceID = KeyGenerator.generateDeviceID();
    Store.setDeviceID(deviceID);

    logger.info('Generating keyPair...');
    const keyPair = KeyGenerator.generateKeyPair();
    Store.setKeyPair(keyPair);

    logger.info('Generating QR Code...');
    generateAndSaveQRCode();

    Store.setDeviceStatus(DeviceStatus.NEW);
    logger.success('Configuration successfully initialized');
};

configurationService.removeConfiguration = () => {
    Store.reset();
};

configurationService.resumeConfiguration = () => {
    switch (Store.getDeviceStatus()) {
        case DeviceStatus.NEW:
            logger.warning('Device not paired yet. ' +
                'Initializing pairing...');
            PairingService.run();
            break;
        case DeviceStatus.PAIRED:
            logger.warning('Device paired but not activated. ' +
                'Initializing activation process...');
            ActivationService.run();
            break;
        case DeviceStatus.ACTIVE:
            logger.success('Device active');
            ActionService.getActions();
            break;
    }
};

configurationService.getDeviceInfo = () => {
    const data = {
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerOrProductID(),
        'publicKey': Store.getPublicKey()
    };
    if (Store.getDeviceStatus() === DeviceStatus.MULTIPAIR) {
        data.multipair = 1;
        data.aid = Store.getAlternativeID();
    }
    return data;
};
configurationService.updateQRCode = () => {
    const data = JSON.stringify(configurationService.getDeviceInfo());
    Store.saveQRCode(data);
};

function generateAndSaveQRCode () {
    const data = JSON.stringify(configurationService.getDeviceInfo());
    Store.saveQRCode(data);
}

module.exports = configurationService;
