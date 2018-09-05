'use strict';

const Advertise = require('./advertise');
const Store = require('./store');
const Configuration = require('./configuration');
const KeyGenerator = require('./key-generator');
const RegistrationLevel = require('./registration-level');

let registrationLevel = Store.getRegistrationLevel();

if (!Store.hasMakerID()) {
    if (process.argv.length < 3) { // 3rd argument is the makerID
        console.log('\x1b[33m', 'Your personalised makerID has not been set. ' +
            'Run:\n\n\tmake server makerID=REPLACE-WITH-OWN-MAKERID\n');
        process.exit(9); // 9 : Invalid Argument
    }
    Store.setMakerID(process.argv[2]);
}

if (registrationLevel === undefined ||
    registrationLevel === RegistrationLevel.NEW) {
    initializeDevice();
}

Advertise.startAdvertising();
Configuration.startConfiguration();

function initializeDevice () {
    Store.setRegistrationLevel(RegistrationLevel.NEW);

    const deviceID = KeyGenerator.generateDeviceID();
    Store.setDeviceID(deviceID);

    const keyPair = KeyGenerator.generateKeyPair();
    Store.setKeyPair(keyPair);
}
