'use strict';

const Storage = require('node-storage');
const store = new Storage('./data.bot');
const uuidv4 = require('uuid/v4');

const methods = {};


methods.makerID = function() {
    return methods.getValueForKey('makerID');
};


// DO NOT EDIT BELOW


methods.setValueForKey = function(key, value) {
    let encryptedValue = value; // Why is encryptedValue used?
    if (value === '') {
      store.remove(key);
    } else {
      store.put(key, encryptedValue); // Why not simply store.put(key, value); ?
   }
};

methods.getValueForKey = function(key) {
	return store.get(key);
};

methods.botID = function() {
	return methods.getValueForKey('botID');
};

methods.hasMakerID = function() {
    if (methods.makerID() === undefined) {
		console.log('Your personalised makerID has not been set.\nTo set it, bot.js should be run the FIRST time as follows:\n\n\tnode bot.js --makerID REPLACE-WITH-OWN-MAKERID');
		process.exit(2);
    }
};

methods.initializeBoT = function() {
    methods.setValueForKey('regLvl', 0);
    let newBotID = uuidv4();
    methods.setValueForKey('botID', newBotID.toString());

    let keypair = require('keypair');
    let pair = keypair(1024);

    var publicKey = pair.public.replace('-----BEGIN RSA PUBLIC KEY-----\n', '');
    publicKey = publicKey.replace('\n-----END RSA PUBLIC KEY-----\n', '');

    methods.setValueForKey('publicKey', publicKey);
    methods.setValueForKey('botPrvkey', pair.private);
};

methods.processCommandLine = function() {
  var argv = require('yargs')
    .help('help')
    .option('makerID', {
      type: 'string',
      describe: 'REPLACE-WITH-OWN-MAKERID'
    })
    .argv;

    if (argv.makerID) {
      methods.setValueForKey('makerID', argv.makerID);
    }
};

module.exports = methods;
