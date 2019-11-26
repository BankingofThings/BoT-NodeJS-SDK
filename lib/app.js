const ConfigurationService = require('./configuration-service');
const Logger = require('./logger');
const Server = require('./server');
const Store = require('./store');

const logger = new Logger('Startup');

if (!Store.hasProductID()) {
    if (process.argv.length < 3) { // 3rd argument is the productID
        logger.error('Your productID has not been set.');
        logger.warning('Run:\tmake server productID=REPLACE-WITH-PRODUCT-ID');
        process.exit(9); // 9 : Invalid Argument
    }
    Store.setMakerOrProductID(process.argv[2]); // 2 : makerID or productID
    ConfigurationService.initialize();
}

Server.startServer();
