'use strict';

const BotAdvertise = require('./advertise');
const Utils = require('./utils');
const BotConfig = require('./configuration');

let registrationLevel = Utils.getValueForKey('regLvl');

if (!Utils.hasMakerID()) {
    if (process.argv.length < 3) { // 3rd argument is the makerID
        console.log('\x1b[33m', 'Your personalised makerID has not been set. ' +
            'Run:\n\n\tmake server makerID=REPLACE-WITH-OWN-MAKERID\n');
        process.exit(9); // 9 : Invalid Argument
    }
    Utils.setMakerID(process.argv[2]);
}

if (!registrationLevel && !Utils.getDeviceID()) {
    Utils.initializeBoT();
}

BotAdvertise.startAdvertising();
BotConfig.startConfiguration();
