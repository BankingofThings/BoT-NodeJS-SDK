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

controller.getQrcode = (request, response) => {
  //Get QrCode image path using the process working directory
  //The QrCode is saved as PNG image under storage directory

  //Get process working directory
  let processDirectory = __dirname;
  //Extract parent directory path of process working directory
  let directoryPath = processDirectory.substr(0,processDirectory.length-4);
  //Suffix /storage/ to directory path followed by qr.png
  let fileName = "qr.png";
  let filePath = directoryPath + '/storage/' + fileName;

  response.sendFile(filePath, function (error) {
    if (error) {
      logger.error(error);
      response.status(error.statusCode).json({message: error.statusText});
    } else {
      logger.info('Served ' + fileName + ' from directory ' + directoryPath);
    }
  });
};

module.exports = controller;
