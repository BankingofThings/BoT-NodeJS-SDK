const BluetoothService = require('./bluetooth/bluetooth-service');
const Configuration = require('./configuration');
const DeviceStatus = require('./device-status');
const Server = require('./server');
const Store = require('./store');

const WARNING_COLOR = '\x1b[33m';
const PROVIDE_MAKER_ID = 'Your personalised makerID has not been set.\n' +
    'Run:\tmake server makerID=REPLACE-WITH-OWN-MAKERID\n';

if (!Store.hasMakerID()) {
    if (process.argv.length < 3) { // 3rd argument is the makerID
        console.log(WARNING_COLOR, PROVIDE_MAKER_ID);
        process.exit(9); // 9 : Invalid Argument
    }
    Store.setMakerID(process.argv[2]); // 2 : makerID argument
}

const deviceStatus = Store.getDeviceStatus();

if (deviceStatus === undefined || deviceStatus === DeviceStatus.NEW) {
    Configuration.initialize();
}

BluetoothService.startAdvertising();
Server.startServer();
