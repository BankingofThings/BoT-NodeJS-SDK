const chai = require('chai');
const ActionService = require('../lib/action-service.js');
const Store = require('../lib/store.js');

describe('getActions for already paired device', function () {
    it('should return 200 with activated actions list', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke get actions
      let actionsResult = ActionService.getActions();

      //assertions
      actionsResult.then(function(data) {
        chai.assert.notEmpty(data);
      }, function(error) {
        chai.assert.fail(error);
      });
    });
});

describe('Trigger activated action with paired device', function () {
    it('should return status OK', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      let actionID = "902642BD-802D-4BCB-9F0F-BC192A70915D";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke trigger action
      let triggerResult = ActionService.trigger(actionID,null,null);

      //assertions
      let expectedMessage = '{\"status\":\"OK\"}';
      triggerResult.then(function(data) {
        chai.assert.equal(data, expectedMessage);
      }, function(error) {
        chai.assert.fail(error);
      });
    });
});

describe('Trigger action which is not part of given ProductID', function () {
    it('should return 404 Action not found', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      let actionID = "E6509B49-5048-4151-B965-BB7B2DBC7905";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke trigger action
      let triggerResult = ActionService.trigger(actionID,null,null);

      //assertions
      let expectedCode = 404;
      let expectedMessage = 'Action not found';
      triggerResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.code,expectedCode);
        chai.assert.equal(error.message,expectedMessage);
      });
    });
});

describe('Trigger action which part of given ProductID but not activated for device', function () {
    it('should return 400 with status Not-OK', function () {

      //Set MakerID and deviceID to correct UUID strings
      let MakerOrProductID = "D49B5D33-348B-470F-89A4-265313D166CE";
      let deviceID = "ce4f57f1-0379-49f1-b23a-2e198f7c17a1";
      let actionID = "485B3172-DB36-4DFB-98F9-EC947A10D823";
      Store.setMakerOrProductID(MakerOrProductID);
      Store.setDeviceID(deviceID);

      //Invoke trigger action
      let triggerResult = ActionService.trigger(actionID,null,null);

      //assertions
      let expectedCode = 400;
      let expectedMessage = '{\"status\":\"Not-OK\"}';
      triggerResult.then(function(data) {
        chai.assert.fail(data);
      }, function(error) {
        chai.assert.equal(error.statusCode,expectedCode);
        chai.assert.equal(error.message,expectedMessage);
      });
    });
});
