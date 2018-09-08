const ActionService = require('./action-service');
const ConfigurationService = require('./configuration-service');
const DeviceStatus = require('./device-status');
const Store = require('./store');

const HttpError = require('http-errors');

const controller = {};

controller.getPairing = (request, response) => {
    response.json(ConfigurationService.getDeviceInfo());
};

controller.getActions = (request, response) => {
    response.json(ActionService.getActions());
};

controller.postActions = (request, response) => {
    if (Store.getDeviceStatus() !== DeviceStatus.ACTIVE) {
        throw new HttpError(403);
    }
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        const payload = JSON.parse(body);
        if (payload.hasOwnProperty('actionID')) {
            throw new HttpError(400, 'Missing property `actionID`');
        }
        ActionService.triggerWithPayload(payload);
        response.json({message: 'Action Triggered'});
    });
};

module.exports = controller;
