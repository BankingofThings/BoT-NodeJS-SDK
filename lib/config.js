const ConfigurationService = require('./configuration-service');
const Logger = require('./logger');
const Store = require('./store');
const DeviceStatus = require('./device-status');

const logger = new Logger('Startup');

if (process.argv[2] == "makerID") {
	logger.info("Setting makerID to:" + process.argv[3]);
     Store.setMakerID(process.argv[3]); // 2 : makerID argument
}

if (process.argv[2] == "multipair") {
	logger.info("Setting mode to Multipair");
	Store.setDeviceStatus(DeviceStatus.MULTIPAIR);
}

if (process.argv[2] == "aid") {
	logger.info("Setting alternativeID to:" + process.argv[3]);
	Store.setAlternativeID(process.argv[3]);
}
