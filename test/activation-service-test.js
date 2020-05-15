const chai = require('chai');
const ActivationService = require('../lib/activation-service.js');
const Store = require('../lib/store.js');
const DeviceStatus = require('../lib/device-status');

describe('Request activation for not existing device', function () {
    it('should return 404 Not found', function () {
      this.skip();
      //Set MakerID and deviceID to unknown UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-qwer-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke send activation
      let activationResult = ActivationService.sendActivation();

      //assertions
      let expectedMessage = 'Given deviceID '+deviceID +' does not exist';
      let expectedStatusCode = 404;
      activationResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.statusCode, expectedStatusCode);
        chai.assert.equal(error.message, expectedMessage);
      });
    });
});

describe('Request activation for already paired device', function () {
    it('should return 200', function () {
      //This test has to be run on device configured with correct ProductID,
      //DeviceID.
      this.skip();

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";

      //Invoke send activation
      let activationResult = ActivationService.sendActivation();

      //assertions
      let expectedMessage = '{"deviceID": "' +deviceID + '"}';
      activationResult.then(function(data) {
        chai.assert.equal(data.message, expectedMessage);
      }, function(error) {
        chai.assert.fail(error);
      });
    });
});

describe('Poll activation status for already paired device', function () {
    it('should return 200', function () {
      //This test has to be run on device configured with correct ProductID,
      //DeviceID.
      this.skip();

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";

      //Invoke poll activation
      let activationResult = ActivationService.pollActivation();

      //assertions
      let expectedMessage = '{"deviceID": "' +deviceID + '"}';
      activationResult.then(function(data) {
        chai.assert.equal(data.message, expectedMessage);
      }, function(error) {
        chai.assert.fail(error);
      });
    });
});

describe('Poll activation status for not existing device', function () {
    it('should return 404 Not found', function () {
      //Set MakerID and deviceID to unknown UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-qwer-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke poll activation
      let pollResult = ActivationService.pollActivation();

      //assertions
      let expectedMessage = 'Given deviceID '+deviceID +' does not exist';
      let expectedStatusCode = 404;
      pollResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.statusCode, expectedStatusCode);
        chai.assert.equal(error.message, expectedMessage);
      });
    });
});
