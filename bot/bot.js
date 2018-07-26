'use strict';

const BotAdvertise = require('./advertise');
const Communication = require('./communication');
const BotActions = require('./actions');
const Utils = require('./utils');
const BotConfig = require('./botConfiguration');

let registrationLevel = Utils.getValueForKey('regLvl');

/*
    Store makerID (overwriting any previous value) if correctly passed as command line parameter:
*/
// 	TODO: create more "generic" solution if *additional* parameters are possible in the future!
let argCount = process.argv.length;
if (argCount > 2 && argCount < 5){
	if (argCount === 4 && process.argv[2] === '--makerID'){
		Utils.storeMakerID(process.argv[3]); // Alternatively, simply use setValueForKey directly?
	} else {
		console.log('Usage: node bot.js --makerID REPLACE-WITH-OWN-MAKERID');
	}
}

Utils.hasMakerID();

if (!registrationLevel && !Utils.botID()) {
    Utils.initializeBoT();
}

BotAdvertise.startAdvertising();
BotConfig.startConfiuration();
