const Logger = require('./logger');

const Storage = require('node-storage');

const actionStorage = new Storage('./storage/actions.json');
const configurationStorage = new Storage('./storage/configuration.json');
const lastTriggeredStorage = new Storage('./storage/last-triggered.json');

const fileSystem = require('fs');
const QRCode = require('qrcode');

const logger = new Logger('Store');
const store = {};

store.hasMakerID = () => {
    return store.getMakerID() !== undefined;
};

store.getMakerID = () => {
    return getValueForKey('makerID');
};

store.setMakerID = (makerID) => {
    setValueForKey('makerID', makerID);
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
    QRCode.toFile('./storage/qr.png', data, (error) => {
        if (error) {
            logger.error('Store: Could not save QR Code. Error: ', error);
        }
    });
};

store.getQRCode  = () => {
    return new Promise((resolve, reject) => {
      fileSystem.readFile('storage/qr.png', function(error, content) {
        if (error) resolve(error);
        resolve(content);
      });
      });
};

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
