const ConfigurationService = require('./configuration-service');
const Logger = require('./logger');
const Server = require('./server');
const Store = require('./store');

const logger = new Logger('Startup');

if (!Store.hasMakerID()) {
    if (process.argv.length < 3) { // 3rd argument is the makerID
        logger.error('Your makerID has not been set.');
        logger.warning('Run:\tmake server makerID=REPLACE-WITH-OWN-MAKERID');
        process.exit(9); // 9 : Invalid Argument
    }
    Store.setMakerID(process.argv[2]); // 2 : makerID argument
    ConfigurationService.initialize();
}

Server.startServer();
