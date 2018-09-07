const ActionService = require('./action-service');
const BoTService = require('./bot-service');
const DeviceStatus = require('./device-status');
const KeyGenerator = require('./key-generator');
const Store = require('./store');

let methods = {};

methods.initialize = () => {
    Store.setDeviceStatus(DeviceStatus.NEW);

    const deviceID = KeyGenerator.generateDeviceID();
    Store.setDeviceID(deviceID);

    const keyPair = KeyGenerator.generateKeyPair();
    Store.setKeyPair(keyPair);

    generateAndSaveQRCode();
};

methods.resumeConfiguration = () => {
    switch (Store.getDeviceStatus()) {
        case DeviceStatus.NEW:
            checkIfDeviceIsPaired();
            break;
        case DeviceStatus.PAIRED:
            activateDevice();
            startDevice();
            break;
        case DeviceStatus.ACTIVE:
            startDevice();
            break;
    }
};

methods.getDeviceInfo = () => {
    return {
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'publicKey': Store.getPublicKey()
    };
};

methods.completePairing = () => {
    Store.setDeviceStatus(DeviceStatus.PAIRED);
    console.log('Device successfully paired.');
    methods.resumeConfiguration();
};

methods.completeActivation = () => {
    Store.setDeviceStatus(DeviceStatus.ACTIVE);
    console.log('Device successfully activated.');
    methods.resumeConfiguration();
};

function generateAndSaveQRCode () {
    let data = JSON.stringify({
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'publicKey': Store.getPublicKey()
    });

    Store.saveQRCode(data);
}

function startDevice () {
    ActionService.refreshActions();
}

function checkIfDeviceIsPaired () {
    const makerID = Store.getMakerID();
    const deviceID = Store.getDeviceID();
    let response = BoTService.getJSON('pair' + '/' + makerID + '/' + deviceID);
    response.then((result) => {
            if (result === 'true') {
                methods.completePairing();
            }
        }, (error) => console.log(error)
    );
}

function activateDevice () {
    const body = JSON.stringify({
        'deviceID': Store.getDeviceID()
    });

    BoTService.post('status', body);
    methods.completeActivation();
}

module.exports = methods;
