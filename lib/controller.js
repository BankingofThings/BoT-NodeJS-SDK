const ActionService = require('./action-service');
const Configuration = require('./configuration');
const DeviceStatus = require('./device-status');
const Store = require('./store');

const METHOD_POST = 'POST';
const METHOD_GET = 'GET';

const HTTP_OK = 200;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

const HTTP_STATUS_MESSAGES = {
    HTTP_OK: 'OK',
    HTTP_FORBIDDEN: 'Forbidden',
    HTTP_NOT_FOUND: 'Not Found'
};

const methods = {};

methods.getPairing = (request, response) => {
    if (request.method !== METHOD_GET) {
        sendResponse(response, HTTP_NOT_FOUND);
        return;
    }
    const data = Configuration.getDeviceInfo();
    sendJsonResponse(data);
};

methods.getActions = (request, response) => {
    if (request.method !== METHOD_GET) {
        sendResponse(response, HTTP_NOT_FOUND);
        return;
    }
    sendJsonResponse(ActionService.getActions());
};

methods.postActions = (request, response) => {
    if (request.method !== METHOD_POST) {
        sendResponse(response, HTTP_NOT_FOUND);
    }
    if (Store.getDeviceStatus() !== DeviceStatus.ACTIVE) {
        sendResponse(response, HTTP_FORBIDDEN);
    }
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        const success = ActionService.triggerWithPayload(JSON.parse(body));

        const statusCode = success ? HTTP_OK : HTTP_FORBIDDEN;
        sendResponse(response, statusCode);
    });
};

function sendJsonResponse (response, data) {
    response.statusCode = HTTP_OK;
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(data));
    response.end();
}

function sendResponse (response, statusCode) {
    response.statusCode = statusCode;
    const body = {
        'statusCode': statusCode,
        'message': HTTP_STATUS_MESSAGES[statusCode]
    };
    response.write(JSON.stringify(body));
    response.end();
}

module.exports = methods;
