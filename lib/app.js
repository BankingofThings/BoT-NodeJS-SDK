const ConfigurationService = require('./configuration-service');
const Logger = require('./logger');
const Server = require('./server');
const Store = require('./store');

const logger = new Logger('Startup');

if (!Store.hasMakerID()) {
    ConfigurationService.initialize();
}

Server.startServer();
