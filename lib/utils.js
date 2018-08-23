'use strict';

const Storage = require('node-storage');
const uuidv4 = require('uuid/v4');

const store = new Storage('./storage/data.bot');
const methods = {};

methods.hasMakerID = function () {
    return methods.getMakerID() !== undefined;
};

methods.getMakerID = function () {
    return methods.getValueForKey('makerID');
};

methods.setMakerID = function (makerID) {
    methods.setValueForKey('makerID', makerID);
};

methods.setValueForKey = function (key, value) {
    value === ''
        ? store.remove(key)
        : store.put(key, value);
};

// Defaults to undefined of key is not found
methods.getValueForKey = function (key) {
    return store.get(key);
};

methods.botID = function () {
    return methods.getValueForKey('botID');
};

methods.initializeBoT = function () {
    methods.setValueForKey('regLvl', 0);
    let newBotID = uuidv4();
    methods.setValueForKey('botID', newBotID.toString());

    let keypair = require('keypair');
    let pair = keypair(1024);

    let publicKey = pair.public.replace('-----BEGIN RSA PUBLIC KEY-----\n', '');
    publicKey = publicKey.replace('\n-----END RSA PUBLIC KEY-----\n', '');

    methods.setValueForKey('publicKey', publicKey);
    methods.setValueForKey('botPrvkey', pair.private);
};

module.exports = methods;
