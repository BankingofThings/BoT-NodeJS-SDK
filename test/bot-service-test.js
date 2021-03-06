const chai = require('chai');
const bot = require("../lib/bot-service.js")
const Store = require('../lib/store.js');

describe('get (/)', function () {
    it('should return makerID error', function () {
      //Reset the Store
      Store.setMakerOrProductID(undefined);
      Store.setDeviceID(undefined);
      Store.reset();

      //Invoke GET request
      let getResult = bot.get("/")

      //assertions
      let expectedMessage = '"value" required in setHeader("makerID", value)'
      getResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.message, expectedMessage);
      });
    });
});

describe('get (/)', function () {
    it('should return deviceID error', function () {
      //Reset the Store
      Store.setDeviceID(undefined);
      Store.reset();

      //Set MakerID to some UUID string
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      Store.setMakerOrProductID(MakerOrProductID);

      //Invoke GET request
      let getResult = bot.get("/")

      //assertions
      let expectedMessage = '"value" required in setHeader("deviceID", value)'
      getResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.message, expectedMessage);
      });
    });
});

describe('get (URL)', function () {
    it('should return unable to decode response', function () {

      //Set MakerID and deviceID to some UUID string
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      let deviceID = "2e16d979-0243-44cd-a065-49af1d974e9e";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke GET request
      let getResult = bot.get("https://makethingsfinn.com/")

      //assertions
      let expectedErrorMessage = 'Unable to decode response from BoT server.'
      getResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.message, expectedErrorMessage);
      });
    });
});

describe('get (/)', function () {
    it('should return 302 with empty message', function () {

      //Set MakerID and deviceID to some UUID string
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      let deviceID = "2e16d979-0243-44cd-a065-49af1d974e9e";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke GET request
      let getResult = bot.get("/")

      //assertions
      let expectedMessage = '';
      let expectedStatusCode = 302;
      getResult.then(function(data) {
        chai.assert.fail(data)
      }, function(error) {
        chai.assert.equal(error.statusCode, expectedStatusCode)
        chai.assert.equal(error.message, expectedMessage)
      });
    });
});

describe('get (/pair)', function () {
    it('should return with status as false', function () {

      //Set MakerID and deviceID to some UUID string
      let MakerOrProductID = "3097b563-078f-4980-b58d-68d6e14d68fd";
      let deviceID = "2e16d979-0243-44cd-a065-49af1d974e9e";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke GET request
      let getResult = bot.get("/pair")

      //assertions
      let expectedMessage = '{"status":false}';
      getResult.then(function(data) {
        chai.assert.equal(data, expectedMessage)
      }, function(error) {
        chai.assert.fail(error)
      });
    });
});

describe('get (/pair)', function () {
    it('should return status as true', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke GET request
      let getResult = bot.get("/pair")

      //assertions
      let expectedMessage = '{"status":true}';
      getResult.then(function(data) {
        chai.assert.equal(data, expectedMessage)
      }, function(error) {
        chai.assert.fail(error)
      });
    });
});

describe('get (/actions)', function () {
    it('should return actions array', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke GET request
      let getResult = bot.get("/actions")

      //assertions
      getResult.then(function(data) {
        chai.assert.isNotEmpty(data)
      }, function(error) {
        chai.assert.fail(error)
      });
    });
});

describe('post (/status) with paired device', function () {
    it('should return 200', function () {
      //This test has to be run on device configured with correct ProductID,
      //DeviceID.
      this.skip();

      //Reset the Store
      Store.setMakerOrProductID(undefined);
      Store.setDeviceID(undefined);
      Store.reset();

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke GET request
      let postResult = bot.post("/status")

      //assertions
      let expectedMessage = '{"deviceID": "' +deviceID + '"}';
      postResult.then(function(data) {
        chai.assert.equal(data.message, expectedMessage);
      }, function(error) {
        chai.assert.fail(error)
      });
    });
});
