'use strict';

const Storage = require('node-storage');
const configurationStorage = new Storage('./storage/configuration.json');
const lastTriggeredStorage = new Storage('./storage/last-triggered.json');

const methods = {};

methods.hasMakerID = function () {
    return methods.getMakerID() !== undefined;
};

methods.getMakerID = function () {
    return getValueForKey('makerID');
};

methods.setMakerID = function (makerID) {
    setValueForKey('makerID', makerID);
};

methods.getRegistrationLevel = function () {
    return getValueForKey('regLvl');
};

methods.setRegistrationLevel = function (registrationLevel) {
    setValueForKey('regLvl', registrationLevel);
};

methods.getActions = function () {
    getValueForKey('actions');
};

methods.setActions = function (actions) {
    setValueForKey('actions', actions);
};

methods.getDeviceID = function () {
    return getValueForKey('deviceID');
};

methods.setDeviceID = (deviceID) => {
    setValueForKey('deviceID', deviceID);
};

methods.setKeyPair = ({publicKey, privateKey}) => {
    setValueForKey('publicKey', publicKey);
    setValueForKey('privateKey', privateKey);
};

methods.getPrivateKey = function () {
    return getValueForKey('privateKey');
};

methods.getPublicKey = function () {
    return getValueForKey('publicKey');
};

methods.getLastTriggeredAt = function (actionID) {
    return lastTriggeredStorage.get(actionID);
};

methods.setLastTriggeredAt = function (actionID, date) {
    lastTriggeredStorage.put(key, date);
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
