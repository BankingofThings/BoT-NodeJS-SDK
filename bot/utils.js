'use strict';

const Storage = require('node-storage');
const store = new Storage('./data.bot');
const uuidv4 = require('uuid/v4');

const methods = {};


methods.makerID = function() {
    return 'REPLACE-WITH-OWN-MAKERID';
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
    if (this.makerID() === 'REPLACE-WITH-OWN-MAKERID') {
        console.log('Please add your personalised MakerID here.');
        console.log('utils.js line 7');
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

module.exports = methods;
