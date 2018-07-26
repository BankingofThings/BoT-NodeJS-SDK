'use strict';

const BotAdvertise = require('./advertise');
const Communication = require('./communication');
const BotActions = require('./actions');
const Utils = require('./utils');

var methods = {};

methods.startConfiuration = function() {
let registrationLevel = Utils.getValueForKey('regLvl');

if (registrationLevel === 1) {
    // Pending device activation
    let postData = JSON.stringify({
        'deviceID': Utils.botID(),
    });

    Communication.post('status', postData, function(success) {
        success(true);
    });

    Utils.setValueForKey('regLvl', 2);
    Utils.setValueForKey('botPubkey', '');
}
if (registrationLevel >= 1) {
    console.log('Registered Start Advertising');
    require('dns').resolve('www.google.com', function(err) {
        if (err) {
            console.log('Unable to connect to the internet.');
        } else {
            BotActions.refreshActions();
            BotActions.startServer();
        }
    });
  }
};

module.exports = methods;
