'use strict';

const BotAdvertise = require('./advertise');
const Communication = require('./communication');
const BotActions = require('./actions');
const Utils = require('./utils');
const BotConfig = require('./botConfiguration');

let registrationLevel = Utils.getValueForKey('regLvl');
Utils.hasMAkerID();

if (!registrationLevel && !Utils.botID()) {
    Utils.initializeBoT();
}

BotAdvertise.startAdvertising();
BotConfig.startConfiuration();
