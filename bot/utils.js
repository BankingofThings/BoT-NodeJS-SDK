'use strict';

const Storage = require('node-storage');
const store = new Storage('./data.bot');
const uuidv4 = require('uuid/v4');

const methods = {};

methods.makerID = function () {
    return methods.getValueForKey('makerID');
};

methods.setValueForKey = function (key, value) {
    value === ''
        ? store.remove(key)
        : store.put(key, value);
};

methods.getValueForKey = function (key) {
    return store.get(key);
};

methods.botID = function () {
    return methods.getValueForKey('botID');
};

methods.hasMakerID = function () {
    if (methods.makerID() === undefined) {
        console.log('Your personalised makerID has not been set.\nTo set it, bot.js should be run the FIRST time as follows:\n\n\tnode bot.js --makerID REPLACE-WITH-OWN-MAKERID');
        process.exit(9); // 9 : Invalid Argument
    }
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

methods.processCommandLine = function () {
    let argv = require('yargs')
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
