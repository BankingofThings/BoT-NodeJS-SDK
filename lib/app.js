const ConfigurationService = require('./configuration-service');
const Logger = require('./logger');
const Server = require('./server');
const Store = require('./store');

const logger = new Logger('Startup');

if (process.env.NODE_ENV == "cloud") {
    //this will make it skip all checks for status new
    Store.setDeviceStatus(DeviceStatus.MULTIPAIR);
    logger.info('We are in the cloud, skipping initialization ...');

} else if (!Store.hasMakerID()) {
    if (process.argv.length < 3) { // 3rd argument is the makerID
        logger.error('Your productID has not been set.');
        logger.warning('Run:\tmake server productID=REPLACE-WITH-PRODUCT-ID');
        process.exit(9); // 9 : Invalid Argument
    }
    Store.setProductID(process.argv[2]); // 2 : productID argument
    ConfigurationService.initialize();
}

Server.startServer();
