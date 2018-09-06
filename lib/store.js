const Storage = require('node-storage');

const configurationStorage = new Storage('./storage/configuration.json');
const lastTriggeredStorage = new Storage('./storage/last-triggered.json');

const fileStorage = require('fs');
const QRCode = require('qrcode');

const methods = {};

methods.hasMakerID = () => {
    return methods.getMakerID() !== undefined;
};

methods.getMakerID = () => {
    return getValueForKey('makerID');
};

methods.setMakerID = (makerID) => {
    setValueForKey('makerID', makerID);
};

methods.getDeviceStatus = () => {
    return getValueForKey('regLvl');
};

methods.setDeviceStatus = (deviceStatus) => {
    setValueForKey('deviceStatus', deviceStatus);
};

methods.getActions = () => {
    getValueForKey('actions');
};

methods.setActions = (actions) => {
    setValueForKey('actions', actions);
};

methods.getDeviceID = () => {
    return getValueForKey('deviceID');
};

methods.setDeviceID = (deviceID) => {
    setValueForKey('deviceID', deviceID);
};

methods.setKeyPair = ({publicKey, privateKey}) => {
    setValueForKey('publicKey', publicKey);
    setValueForKey('privateKey', privateKey);
};

methods.getPrivateKey = () => {
    return getValueForKey('privateKey');
};

methods.getPublicKey = () => {
    return getValueForKey('publicKey');
};

methods.getApiPublicKey = () => {
    return fileStorage.readFileSync('./storage/public.pem');
};

methods.getLastTriggeredAt = (actionID) => {
    return lastTriggeredStorage.get(actionID);
};

methods.setLastTriggeredAt = (actionID, date) => {
    lastTriggeredStorage.put(key, date);
};

methods.saveQRCode = (data) => {
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

module.exports = methods;
