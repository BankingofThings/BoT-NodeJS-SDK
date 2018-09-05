const RegistrationLevel = require('./registration-level');
const Communication = require('./communication');
const Actions = require('./actions');
const Store = require('./store');
const Server = require('./server');

let methods = {};

methods.startConfiguration = () => {
    Server.startServer();

    let registrationLevel = Store.getRegistrationLevel();

    switch (registrationLevel) {
        case RegistrationLevel.NEW:
            setupDevice();
            break;
        case RegistrationLevel.PAIRED:
            activateDevice();
            startDevice();
            break;
        case RegistrationLevel.ACTIVE:
            startDevice();
            break;
    }
};

function startDevice () {
    console.log('Registered Start Advertising');
    Actions.refreshActions();
}

function setupDevice () {
    let makerID = Store.getMakerID();
    let deviceID = Store.getDeviceID();
    let pairingLevel = Communication.getJSON('pair', makerID + '/' + deviceID);
    pairingLevel.then(function (result) {
        if (result === 'true') {
            Store.setRegistrationLevel(RegistrationLevel.PAIRED);
            setTimeout(() => {
                // TODO : refactor so it doesn't have to restart
                console.log('Device is paired. Please restart BoT to activate');
                process.exit(2);
            }, 1500);
        }
    }, function (err) {
        console.log(err);
    });
}

function activateDevice () {
    const body = JSON.stringify({
        'deviceID': Store.getDeviceID()
    });

    Communication.post('status', body);
    Store.setRegistrationLevel(RegistrationLevel.ACTIVE);
    console.log('Device successfully activated');
}

module.exports = methods;
