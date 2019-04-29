const ActionService = require('./action-service');
const ConfigurationService = require('./configuration-service');
const DeviceStatus = require('./device-status');
const PairingService = require('./pairing-service');
const Store = require('./store');

const HttpError = require('http-errors');

const controller = {};

controller.getPairing = (request, response) => {
    if (Store.getDeviceStatus() !== DeviceStatus.NEW) {
        throw new HttpError(403, 'Device is already paired');
    }
    response.json(ConfigurationService.getDeviceInfo());
    PairingService.run();
};

controller.getActions = (request, response) => {
    ActionService.getActions()
        .then((actions) => response.json(actions))
        .catch(() => {
            response.status(503).json({message: 'Unable to retrieve actions'});
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
    const alternativeID = payload.hasOwnProperty('alternativeID') ? payload.alternativeID : null;

    ActionService.trigger(payload.actionID, value, alternativeID)
        .then((json) => {
            const responseJson = {message: 'Action Triggered'};
            if (json.hasOwnProperty('usingActionID')) {
                responseJson.usingActionID = json.usingActionID;
            }
            response.json(responseJson);
        })
        .catch(({code, message}) => {
            response.status(code).json({message: message});
        });
};

module.exports = controller;
