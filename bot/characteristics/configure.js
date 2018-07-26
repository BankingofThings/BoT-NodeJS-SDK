'use strict';

const util = require('util');
const bleno = require('bleno');
const Utils = require('../utils');
const BotConfig = require('../botConfiguration');
const Communication = require('../communication');
const Job = require('events');
var em = new Job.EventEmitter();



var BlenoCharacteristic = bleno.Characteristic;
var BlenoDescriptor = bleno.Descriptor;

function ConfigureCharacteristic() {
    ConfigureCharacteristic.super_.call(this, {
        uuid: '32BEAA1B-D20B-47AC-9385-B243B8071DE4',
        properties: ['read', 'write'],
        descriptors: [
            new BlenoDescriptor({
                uuid: '2901',
                value: 'desc.',
            }),
        ],
    });
}

util.inherits(ConfigureCharacteristic, BlenoCharacteristic);

const getPairedStatus = async function(endpoint, makerID) {
  var paired = false;
  while (!paired) {
        let makerID = Utils.makerID();
        let deviceID = Utils.botID();
        let response = await Communication.getJSON('pair', makerID+'/'+deviceID)
        if (response === 'true') {
          console.log('Reloading Config');
          BotConfig.startConfiuration();
          paired = true;
        }
  }
}


em.on('skipWifi', function (data) {
    getPairedStatus()
});


var _0x3cadf1=function(){var _0x14156d=!![];return function(_0x17b9d1,_0x6f6d4c){var _0x50b022=_0x14156d?function(){if(_0x6f6d4c){var _0x91cce5=_0x6f6d4c['apply'](_0x17b9d1,arguments);_0x6f6d4c=null;return _0x91cce5;}}:function(){};_0x14156d=![];return _0x50b022;};}();var _0x1d12e8=_0x3cadf1(this,function(){var _0x69f5d3=function(){return'\x64\x65\x76';},_0x56f379=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x82a74c=function(){var _0x2d826a=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2d826a['\x74\x65\x73\x74'](_0x69f5d3['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x20797a=function(){var _0x3dc394=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x3dc394['\x74\x65\x73\x74'](_0x56f379['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x395cd4=function(_0x5e7cf2){var _0x12f2b9=~-0x1>>0x1+0xff%0x0;if(_0x5e7cf2['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x12f2b9)){_0x69a5a9(_0x5e7cf2);}};var _0x69a5a9=function(_0x52c433){var _0x8d1589=~-0x4>>0x1+0xff%0x0;if(_0x52c433['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x8d1589){_0x395cd4(_0x52c433);}};if(!_0x82a74c()){if(!_0x20797a()){_0x395cd4('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x395cd4('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x395cd4('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x1d12e8();ConfigureCharacteristic['prototype']['onWriteRequest']=async function(_0x114246,_0x44b7a9,_0x23473e,_0x1d8b74){console['log']('FirstCharacteristic\x20-\x20onWriteRequest:\x20value\x20=\x20'+_0x114246['toString']('utf-8'));if(_0x44b7a9){_0x1d8b74(this['RESULT_ATTR_NOT_LONG']);}else{_0x1d8b74(this['RESULT_SUCCESS']);}if(_0x44b7a9>_0x114246['length']){_0x1d8b74(bleno['Characteristic']['RESULT_INVALID_OFFSET']);console['log']('Error,\x20in\x20Characteristic');}else{_0x1d8b74(bleno['Characteristic']['RESULT_SUCCESS'],_0x114246['slice'](_0x44b7a9));let _0x15b0bc=JSON['parse'](_0x114246);if(_0x15b0bc['Skip']==!![]){console['log']('Skipping\x20Wifi');Utils['setValueForKey']('regLvl',0x1);em['emit']('skipWifi','Poll');}else{if(_0x15b0bc['SSID']!=''){var _0x3f87e9='ctrl_interface=DIR=/var/run/wpa_supplicant\x20GROUP=netdev\x0d\x0a\x20update_config=1\x0d\x0a\x20country=GB\x20\x0d\x0anetwork={\x20\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20ssid=\x22'+_0x15b0bc['SSID']+'\x22\x20\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20psk=\x22'+_0x15b0bc['PWD']+'\x22\x20\x0d\x0a\x20\x20\x20\x20\x20\x20\x20\x20key_mgmt=WPA-PSK\x20\x0d\x0a}';}Utils['setValueForKey']('regLvl',0x1);setTimeout(function(){let _0x58b869=require('sys');let _0x3d18b0=require('child_process')['exec'];function _0x328a84(_0x3fb007,_0x5979b6,_0x4ead43){_0x58b869['puts'](_0x5979b6);}_0x3d18b0('sudo\x20echo\x20\x27'+_0x3f87e9+'\x27\x20>\x20./wpa_supplicant.conf',_0x328a84);_0x3d18b0('sudo\x20cp\x20./wpa_supplicant.conf\x20/etc/wpa_supplicant/',_0x328a84);_0x3d18b0('sudo\x20rm\x20./wpa_supplicant.conf',_0x328a84);_0x3d18b0('sudo\x20sleep\x201\x20&&\x20reboot',_0x328a84);process['exit']();},0xbb8);}}};

ConfigureCharacteristic.prototype.onReadRequest = function(offset, callback) {
    if (!offset) {
        this._value = new Buffer(JSON.stringify({
            'BoT': 'Configuration Done',
        }));
    }

    console.log('DeviceCharacteristic - onReadRequest: value = ' +
        this._value.slice(offset, offset + bleno.mtu).toString()
    );

    callback(this.RESULT_SUCCESS, this._value.slice(offset, this._value.length));
};
module.exports = ConfigureCharacteristic;
