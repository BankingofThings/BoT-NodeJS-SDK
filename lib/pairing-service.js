const ActivationService = require('./activation-service');
const BotService = require('./bot-service');
const DeviceStatus = require('./device-status');
const Logger = require('./logger');
const Store = require('./store');

const POLLING_INTERVAL_IN_MILLISECONDS = 10000;
const MAXIMUM_TRIES = 10;

const logger = new Logger('Pairing Service');
const pairingService = {};

pairingService.run = () => {
    if (!pairingService.isPairable()) {
        return;
    }

    if (pairingService.isMultipair()) {
        logger.info('Multipair mode, no need to poll or delete keys...');
        return;
    }
    pairingService.pollPairingStatus()
        .then((response) => {
            if (!pairingService.isPairable()) {
                return;
            }
            Store.setDeviceStatus(DeviceStatus.PAIRED);
            Store.removePublicKey();
            logger.success('Device successfully paired. Ready to activate.');
            ActivationService.run();
        })
        .catch((error) => {
            if (pairingService.isPairable()) {
                logger.warning('Device pairing not yet completed.');
            }
            logger.error(error);
        });
};

pairingService.pollPairingStatus = () => {
    if (!pairingService.isPairable()) {
        return;
    }

    logger.info('Started polling BoT for pairing status...');
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
                if (!pairingService.isPairable()) {
                    return;
                }
                logger.info('Checking pairing status, attempt ' + (++counter) +
                    ' of ' + MAXIMUM_TRIES);
                pairingService.getPairingStatus()
                    .then((response) => {
                        clearInterval(interval);
                        resolve(response);
                    })
                    .catch((error) => {
                        if (!pairingService.isPairable()
                            || counter >= MAXIMUM_TRIES) {
                            clearInterval(interval);
                            reject(error);
                        }
                    });
            }, POLLING_INTERVAL_IN_MILLISECONDS
        );
    });
};

pairingService.isMultipair = () => {
    return Store.getDeviceStatus() === DeviceStatus.MULTIPAIR;
};

pairingService.isPairable = () => {
    if (pairingService.isMultipair()) {
        logger.info('Multipair mode');
        return true;
    }
    return Store.getDeviceStatus() === DeviceStatus.NEW;
};

pairingService.getPairingStatus = () => {
    return new Promise((resolve, reject) => {
        BotService.get('/pair')
            .then((response) => {
                JSON.parse(response).status === true ? resolve(response)
                                                      : reject(response);
            })
            .catch((error) => reject(error));
    });
};

module.exports = pairingService;
