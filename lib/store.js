// TODO : Find a more recent package, this one was last published 4 years ago.
const Storage = require('node-storage');

const configurationStorage = new Storage('./storage/configuration.json');
const lastTriggeredStorage = new Storage('./storage/last-triggered.json');

const fileSystem = require('fs');
const QRCode = require('qrcode');

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

store.getActions = () => {
    getValueForKey('actions');
};

store.setActions = (actions) => {
    setValueForKey('actions', actions);
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

store.getLastTriggeredAt = (actionID) => {
    return lastTriggeredStorage.get(actionID);
};

store.setLastTriggeredAt = (actionID, date) => {
    lastTriggeredStorage.put(key, date);
};

store.saveQRCode = (data) => {
    QRCode.toFile('./storage/qr.png', data, (error) => {
        if (error) console.log(error);
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
