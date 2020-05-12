const chai = require('chai');
const PairingService = require('../lib/pairing-service.js');
const Store = require('../lib/store.js');
const DeviceStatus = require('../lib/device-status');

describe('getPairingStatus for already paired device', function () {
    it('should return 200 with status as true', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke get pairing status
      let pairResult = PairingService.getPairingStatus();

      //assertions
      let expectedMessage = '{"status":true}';
      pairResult.then(function(data) {
        chai.assert.equal(data, expectedMessage)
      }, function(error) {
        chai.assert.fail(error)
      });
    });
});

describe('getPairingStatus for not paired device', function () {
    it('should return 206 with status as false', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      let deviceID = "2e16d979-0243-44cd-a065-49af1d974e9e";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke get pairing status
      let pairResult = PairingService.getPairingStatus();

      //assertions
      let expectedMessage = '{"status":false}';
      let expectedStatusCode = 206;
      pairResult.then(function(data) {
        chai.assert.fail(data)
      }, function(error) {
        chai.assert.equal(error.statusCode, expectedStatusCode)
        chai.assert.equal(error.message, expectedMessage)
      });
    });
});

describe('pollPairingStatus for not paired device', function () {
    it('should return 206 with status as false', function () {
      //Comment below line to run this unit as it tries for multiple attempts for polling
      this.skip();
      //Set MakerID and deviceID to some UUID strings
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      let deviceID = "2e16d979-0243-44cd-a065-49af1d974e9e";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);
      Store.setDeviceStatus(DeviceStatus.NEW);

      //Invoke poll pairing status
      let pollResult = PairingService.pollPairingStatus();

      //assertions
      let expectedMessage = '{"status":false}';
      let expectedStatusCode = 206;
      pollResult.then(function(data) {
        chai.assert.fail(data)
      }, function(error) {
        chai.assert.equal(error.statusCode, expectedStatusCode)
        chai.assert.equal(error.message, expectedMessage)
      });
    });
});

describe('pollPairingStatus for already paired device', function () {
    it('should return 200 with status as true', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);
      Store.setDeviceStatus(DeviceStatus.NEW);

      //Invoke get pairing status
      let pollResult = PairingService.pollPairingStatus();

      //assertions
      let expectedMessage = '{"status":true}';
      pollResult.then(function(data) {
        chai.assert.equal(data, expectedMessage)
        Store.setDeviceStatus(DeviceStatus.PAIRED);
      }, function(error) {
        chai.assert.fail(error)
      });
    });
});

describe('Run pairing for not paired device', function () {
    it('should remain device state as NEW', function () {
      //Comment below line to run this unit as it tries for multiple attempts for polling
      this.skip();
      //Set MakerID and deviceID to some UUID strings
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      let deviceID = "2e16d979-0243-44cd-a065-49af1d974e9e";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);
      Store.setDeviceStatus(DeviceStatus.NEW);

      //Invoke Pairing Service Run
      let pairResult = PairingService.run();

      //Device state remains as NEW
      chai.assert.equal(Store.getDeviceStatus(), DeviceStatus.NEW);
    });
});

describe('Run pairing for already paired device', function () {
    it('should update device state to PAIRED', function () {
      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);
      Store.setDeviceStatus(DeviceStatus.NEW);

      //Invoke Pairing Service Run
      let pairResult = PairingService.run();

      //Device state should be changed to PAIRED after retrieving pair status
      setTimeout(() => {  chai.assert.equal(Store.getDeviceStatus(), DeviceStatus.PAIRED) }, 4000);
    });
});
