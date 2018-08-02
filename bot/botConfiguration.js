'use strict';

const BotAdvertise = require('./advertise');
const Communication = require('./communication');
const BotActions = require('./actions');
const Utils = require('./utils');
ß
var methods = {};

methods.startConfiuration = function() {
let registrationLevel = Utils.getValueForKey('regLvl');
BotActions.startServer();

if (registrationLevel === 0) {
  let makerID = Utils.makerID();
  let deviceID = Utils.botID();
  let pairingLevel = Communication.getJSON('pair', makerID+'/'+deviceID)
  pairingLevel.then(function(result) {
      if (result === 'true') {
        Utils.setValueForKey('regLvl', 1);
        setTimeout(() => {
          console.log('Pairing state changed please reload bot.');
          process.exit(2);
        }, 1500);
      }
    }, function(err) {
         console.log(err);
    })
} else if (registrationLevel === 1) {
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
        }
    });
  }
};

module.exports = methods;
