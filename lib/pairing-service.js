const ActivationService = require('./activation-service');
const BotService = require('./bot-service');
const DeviceStatus = require('./device-status');
const Logger = require('./logger');
const Store = require('./store');

const POLLING_INTERVAL_IN_MILLISECONDS = 1000; // TODO Change to 10000 every 10s
const MAXIMUM_TRIES = 3; // TODO change to 10 (will try for 1.5m)

const logger = new Logger('Pairing Service');
const pairingService = {};

pairingService.run = () => {
    pairingService.pollPairingStatus()
        .then(() => {
            Store.setDeviceStatus(DeviceStatus.PAIRED);
            Store.removePublicKey();
            logger.success('Device successfully paired. Ready to run.');
            ActivationService.run();
        })
        .catch(() => {
            logger.warning('Device pairing not yet completed.');
        });
};

pairingService.pollPairingStatus = () => {
    logger.info('Started polling BoT for pairing status...');
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(() => {
                logger.info('Checking pairing status, attempt ' + (++counter) +
                    ' of ' + MAXIMUM_TRIES);
                pairingService.getPairingStatus()
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

pairingService.getPairingStatus = () => {
    return new Promise((resolve, reject) => {
        const makerID = Store.getMakerID();
        const deviceID = Store.getDeviceID();
        const endpoint = 'pair' + '/' + makerID + '/' + deviceID;

        BotService.get(endpoint)
            .then((response) => response === 'true' ? resolve() : reject())
            .catch(() => reject());
    });
};

module.exports = pairingService;
