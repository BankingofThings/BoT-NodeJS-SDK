const ConfigurationService = require('./configuration-service');
const Logger = require('./logger');
const Server = require('./server');
const Store = require('./store');
const DeviceStatus = require('./device-status');

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

if (process.argv[2] == "multipair") {
  logger.warning('Running a multipairable server');
    if (Store.getDeviceStatus() != DeviceStatus.MULTIPAIR) {
    	logger.warning('Server did not run in multipair mode before, cleaning internals');
		Store.setDeviceStatus(DeviceStatus.MULTIPAIR);
	}
    	if (process.argv.length == 4) { 
	    	logger.info("Setting alternativeID to:" + process.argv[3]);
			Store.setAlternativeID(process.argv[3]);
  		}
} 

Server.startServer();
