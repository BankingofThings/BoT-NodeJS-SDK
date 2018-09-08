const BoTService = require('./bot-service');
const DeviceStatus = require('./device-status');
const Store = require('./store');

const POLLING_INTERVAL_IN_MILLISECONDS = 5000;
const MAXIMUM_TRIES = 5;

const methods = {};

methods.activate = () => {
    methods.pollActivation()
        .then(() => {
            Store.setDeviceStatus(DeviceStatus.ACTIVE);
            logSuccess('Activation successful. Triggering actions enabled');
        })
        .catch(() => {
            logError('Activation failed');
        });
};

methods.pollActivation = () => {
    log('Start polling device activation...');
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
                log('Activating device, attempt ' + (counter + 1) +
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

methods.activate = () => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            'deviceID': Store.getDeviceID()
        });

        BoTService.post('status', body)
            .then(() => resolve())
            .catch(() => reject());
    });
};

function log (message) {
    console.log('Activation Service:', message);
}

function logSuccess (message) {
    console.log('\x1b[32m' + 'Activation Service:', message, '\x1b[39m');
}

function logError (message) {
    console.log('\x1b[31m' + 'Activation Service:', message, '\x1b[39m');
}

module.exports = methods;
