const ActivationService = require('./activation-service');
const BoTService = require('./bot-service');
const DeviceStatus = require('./device-status');
const Store = require('./store');

const POLLING_INTERVAL_IN_MILLISECONDS = 5000;
const MAXIMUM_TRIES = 5;

const methods = {};

methods.pair = () => {
    methods.pollPairingStatus()
        .then(() => {
            Store.setDeviceStatus(DeviceStatus.PAIRED);
            logSuccess('Pairing successful');
            ActivationService.activate();
        })
        .catch(() => {
            logError('Pairing failed');
        });
};

methods.pollPairingStatus = () => {
    log('Start polling pairing status...');
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
                log('Get pairing status, attempt ' + (counter + 1) +
                    ' of ' + MAXIMUM_TRIES);
                methods.getPairingStatus()
                    .then(() => {
                        clearInterval(interval);
                        resolve();
                    })
                    .catch(() => {
                        counter++;
                        if (counter >= MAXIMUM_TRIES) {
                            clearInterval(interval);
                            reject();
                        }
                    });
            }, POLLING_INTERVAL_IN_MILLISECONDS
        );
    });
};

methods.getPairingStatus = () => {
    return new Promise((resolve, reject) => {
        const makerID = Store.getMakerID();
        const deviceID = Store.getDeviceID();
        const endpoint = 'pair' + '/' + makerID + '/' + deviceID;

        BoTService.get(endpoint)
            .then((response) => response === 'true' ? resolve() : reject())
            .catch(() => reject());
    });
};

function log (message) {
    console.log('Pairing Service:', message);
}

function logSuccess (message) {
    console.log('\x1b[32m' + 'Activation Service:', message, '\x1b[39m');
}

function logError (message) {
    console.log('\x1b[31m' + 'Pairing Service:', message, '\x1b[39m');
}

module.exports = methods;