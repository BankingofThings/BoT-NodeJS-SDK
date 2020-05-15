const ActionService = require('./action-service');
const ConfigurationService = require('./configuration-service');
const DeviceStatus = require('./device-status');
const PairingService = require('./pairing-service');
const Store = require('./store');
const Logger = require('./logger');
const HttpError = require('http-errors');

const controller = {};
const logger = new Logger('Controller Service');

controller.getPairing = (request, response) => {
    if (Store.getDeviceStatus() !== DeviceStatus.NEW) {
        throw new HttpError(409, 'Device is already paired');
    }
    response.json(ConfigurationService.getDeviceInfo());
    PairingService.run();
};

controller.getActions = (request, response) => {
    ActionService.getActions()
        .then((actions) => response.json(actions))
        .catch((error) => {
            response.status(error.statusCode).json({message: error.message});
        });
};

controller.postActions = (request, response) => {
    if (Store.getDeviceStatus() < DeviceStatus.ACTIVE) {
        throw new HttpError(403, 'Device not activated');
    }
    const payload = request.body;
    if (!payload.hasOwnProperty('actionID')) {
        throw new HttpError(400, 'Missing parameter `actionID`');
    }

    if (Store.getDeviceStatus() === DeviceStatus.MULTIPAIR) {
        if (!payload.hasOwnProperty('alternativeID')) {
            throw new HttpError(400, 'Missing parameter `AlternativeID`');
        }
    }

    const value = payload.hasOwnProperty('value') ? payload.value : null;
    const alternativeID = payload.hasOwnProperty('alternativeID')
        ? payload.alternativeID
        : null;

    ActionService.trigger(payload.actionID, value, alternativeID)
        .then((json) => {
            const responseJson = {message: 'Action Triggered'};
            if (json.hasOwnProperty('usingActionID')) {
                responseJson.usingActionID = json.usingActionID;
            }
            response.json(responseJson);
        })
        .catch((error) => {
            response.status(error.statusCode).json({message: error.message});
        });
};

controller.getQrCode = (request, response) => {
  let processDir = __dirname;
  let dirPath = processDir.substr(0,processDir.length-4) + '/storage';
  let fileName = "qr.png";
  let filePath = dirPath + '/' + fileName

  response.sendFile(filePath, function (err) {
    if (err) {
      logger.error(err);
      response.status(404).json({message: filePath + " Not Found"});
    } else {
      logger.info('Served ' + fileName + ' from directory ' + dirPath);
    }
  });
};

module.exports = controller;
