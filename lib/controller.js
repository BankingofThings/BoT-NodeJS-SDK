const ActionService = require('./action-service');
const ConfigurationService = require('./configuration-service');
const DeviceStatus = require('./device-status');
const Store = require('./store');

const HttpError = require('http-errors');

const controller = {};

controller.getPairing = (request, response) => {
    if (Store.getDeviceStatus() !== DeviceStatus.NEW) {
        throw new HttpError(403, 'Device is already paired');
    }
    response.json(ConfigurationService.getDeviceInfo());
};

controller.getActions = (request, response) => {
    ActionService.getActions()
        .then((actions) => response.json(actions))
        .catch(() => {
            throw new HttpError(503, 'Unable to retrieve actions');
        });
};

controller.postActions = (request, response) => {
    if (Store.getDeviceStatus() !== DeviceStatus.ACTIVE) {
        throw new HttpError(403);
    }
    let body = '';
    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        const payload = JSON.parse(body);
        if (payload.hasOwnProperty('actionID')) {
            throw new HttpError(400, 'Missing parameter `actionID`');
        }
        const value = payload.hasOwnProperty('value') ? payload.value : null;
        ActionService.trigger(payload.actionID, value);
        response.json({message: 'Action Triggered'});
    });
};

module.exports = controller;
