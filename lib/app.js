const BluetoothService = require('./bluetooth-service');
const ConfigurationService = require('./configuration-service');
const Server = require('./server');
const Store = require('./store');

const ERROR_START = '\x1b[31mInitialisation:';
const ERROR_END = '\x1b[39m';
const PROVIDE_MAKER_ID = 'Your makerID has not been set.';
const EXAMPLE = '\n\nRun:\tmake server makerID=REPLACE-WITH-OWN-MAKERID\n';

if (!Store.hasMakerID()) {
    if (process.argv.length < 3) { // 3rd argument is the makerID
        console.log(ERROR_START, PROVIDE_MAKER_ID, ERROR_END, EXAMPLE);
        process.exit(9); // 9 : Invalid Argument
    }
    Store.setMakerID(process.argv[2]); // 2 : makerID argument
    ConfigurationService.initialize();
}

BluetoothService.initialize();
Server.startServer();
