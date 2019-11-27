const Logger = require('./logger');

const Storage = require('node-storage');

const actionsPath = './storage/actions.json';
const configurationPath = './storage/configuration.json';
const lastTriggeredPath = './storage/last-triggered.json';
const QRCodePath = './storage/qr.png';

const actionStorage = new Storage(actionsPath);
const configurationStorage = new Storage(configurationPath);
const lastTriggeredStorage = new Storage(lastTriggeredPath);

const fileSystem = require('fs');
const QRCode = require('qrcode');

const logger = new Logger('Store');
const store = {};

store.hasMakerOrProductID = () => {
    return store.getMakerOrProductID() !== undefined;
};

store.getMakerOrProductID = () => {
    return getValueForKey('makerID');
};

store.setMakerOrProductID = (id) => {
    setValueForKey('makerID', id);
};

store.getAlternativeID = () => {
    return getValueForKey('aid');
};

store.setAlternativeID = (alternativeID) => {
    setValueForKey('aid', alternativeID);
};

store.getDeviceStatus = () => {
    return getValueForKey('deviceStatus');
};

store.setDeviceStatus = (deviceStatus) => {
    setValueForKey('deviceStatus', deviceStatus);
};

store.getAlternativeID = () => {
    return getValueForKey('alternativeID');
};

store.setAlternativeID = (aid) => {
    setValueForKey('alternativeID', aid);
};

store.getActions = () => {
    return actionStorage.get('actions');
};

store.setActions = (actions) => {
    actionStorage.put('actions', actions);
};

store.getDeviceID = () => {
    return getValueForKey('deviceID');
};

store.setDeviceID = (deviceID) => {
    setValueForKey('deviceID', deviceID);
};

store.setKeyPair = ({publicKey, privateKey}) => {
    setValueForKey('publicKey', publicKey);
    setValueForKey('privateKey', privateKey);
};

store.getPrivateKey = () => {
    return getValueForKey('privateKey');
};

store.getPublicKey = () => {
    return getValueForKey('publicKey');
};

store.getApiPublicKey = () => {
    return fileSystem.readFileSync('./storage/public.pem');
};

store.removePublicKey = () => {
    setValueForKey('publicKey', '');
};

store.getLastTriggeredAt = (actionID) => {
    return lastTriggeredStorage.get(actionID);
};

store.setLastTriggeredAt = (actionID, date) => {
    lastTriggeredStorage.put(actionID, date);
};

store.saveQRCode = (data) => {
    logger.info('Writing qrcode ....');
    QRCode.toFile(QRCodePath, data, (error) => {
        if (error) {
            logger.error('Store: Could not save QR Code. Error: ', error);
        }
    });
};

store.reset = () => {
    resetFile(actionsPath);
    resetFile(configurationPath);
    resetFile(lastTriggeredPath);
    resetFile(QRCodePath);
};

store.getQRCode = () => {
    logger.info('Reading new qrcode ....');
    return new Promise((resolve, reject) => {
        fileSystem.readFile('./storage/qr.png', function(error, content) {
            if (error) resolve(error);
            resolve(content);
        });
    });
};

function resetFile (path) {
    if (fileSystem.existsSync(path)) {
        fileSystem.unlinkSync(path);
    }
}

function setValueForKey (key, value) {
    value === ''
        ? configurationStorage.remove(key)
        : configurationStorage.put(key, value);
}

// Defaults to undefined if key is not found
function getValueForKey (key) {
    return configurationStorage.get(key);
}

module.exports = store;
