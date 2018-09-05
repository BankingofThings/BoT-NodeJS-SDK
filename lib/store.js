'use strict';

const RegistrationLevel = require('./RegistrationLevel');
const Storage = require('node-storage');
const uuidv4 = require('uuid/v4');
const keypair = require('keypair');

const storage = new Storage('./storage/data.bot');
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

methods.getLastTriggeredAt = function (actionID) {
    let key = 'lastTrigger_' + actionID;
    return getValueForKey(key);
};

methods.setLastTriggeredAt = function (actionID, date) {
    let key = 'lastTrigger_' + actionID;
    setValueForKey(key, date);
};

methods.getDeviceID = function () {
    return getValueForKey('deviceID');
};

methods.getPrivateKey = function () {
    return getValueForKey('privateKey');
};

methods.getPublicKey = function () {
    return getValueForKey('publicKey');
};

methods.initializeBoT = function () {
    methods.setRegistrationLevel(RegistrationLevel.NEW);
    generateAndSetDeviceID();

    let pair = keypair(1024);

    let publicKey = pair.public.replace('-----BEGIN RSA PUBLIC KEY-----\n', '');
    publicKey = publicKey.replace('\n-----END RSA PUBLIC KEY-----\n', '');

    setValueForKey('publicKey', publicKey);
    setValueForKey('privateKey', pair.private);
};

function setValueForKey (key, value) {
    value === ''
        ? storage.remove(key)
        : storage.put(key, value);
}

// Defaults to undefined of key is not found
function getValueForKey (key) {
    return storage.get(key);
}

function generateAndSetDeviceID () {
    let deviceID = uuidv4();
    setValueForKey('deviceID', deviceID.toString());
}

module.exports = methods;
