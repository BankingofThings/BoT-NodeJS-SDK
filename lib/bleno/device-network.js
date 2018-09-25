const Logger = require('../logger');

const bleno = require('bleno');
const os = require('os');
const util = require('util');

const logger = new Logger('Bluetooth Service');

const DeviceNetworkCharacteristic = function () {
    DeviceNetworkCharacteristic.super_.call(this, {
        uuid: 'C42639DC-270D-4690-A8B3-6BA661C6C899',
        properties: ['read']
    });
    this._value = new Buffer(0);
};

DeviceNetworkCharacteristic.prototype.onReadRequest = function (
    offset,
    callback
) {
    if (!offset) {
        logger.info('Device Network info being read by connected device.');
        let ifaces = os.networkInterfaces();
        let nic = '';
        let ip = '';

        Object.keys(ifaces).forEach((ifname) => {
            let alias = 0;

            ifaces[ifname].forEach((iface) => {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (e.g. 127.0.0.1)
                    // and non-ipv4 addresses
                    return;
                }

                if (alias < 1) {
                    // this interface has only one ipv4 address
                    nic = ifname;
                    ip = iface.address;
                }
                ++alias;
            });
        });

        this._value = new Buffer(JSON.stringify({
            'network': nic,
            'ip': ip
        }));
    }
    callback(
        this.RESULT_SUCCESS,
        this._value.slice(offset, this._value.length)
    );
};

util.inherits(DeviceNetworkCharacteristic, bleno.Characteristic);
module.exports = DeviceNetworkCharacteristic;
