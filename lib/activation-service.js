const BotService = require('./bot-service');
const DeviceStatus = require('./device-status');
const Logger = require('./logger');
const Store = require('./store');

const POLLING_INTERVAL_IN_MILLISECONDS = 10000;
const MAXIMUM_TRIES = 3;

const logger = new Logger('Activation Service');
const activationService = {};

activationService.run = () => {
    activationService.pollActivation()
        .then(() => {
            Store.setDeviceStatus(DeviceStatus.ACTIVE);
            logger.success('Activation successful. Triggering actions enabled');
        })
        .catch(() => {
            logger.warning('Unable to activate device. run ' +
                '`make server` to restart the activation process');
        });
};

activationService.pollActivation = () => {
    logger.info('Started polling BoT to activate device...');
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
                logger.info('Activating device, attempt ' + (++counter) +
                    ' of ' + MAXIMUM_TRIES);
                activationService.sendActivation()
                    .then(() => {
                        clearInterval(interval);
                        resolve();
                    })
                    .catch(() => {
                        if (counter >= MAXIMUM_TRIES) {
                            clearInterval(interval);
                            reject();
                        }
                    });
            }, POLLING_INTERVAL_IN_MILLISECONDS
        );
    });
};

activationService.sendActivation = () => {
    return new Promise((resolve, reject) => {
        const body = {
            'deviceID': Store.getDeviceID()
        };
        BotService.post('/status', body)
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject();
            });
    });
};

module.exports = activationService;
