const Actions = require('./actions');
const Store = require('./store');
const Http = require('http');

const methods = {};

methods.startServer = () => {
    let server = Http.createServer(controller);
    let port = 3001;
    server.listen(port, '127.0.0.1');
    console.log('Bot: Starting local server, listening on port: ' + port);

    server.on('error', function (e) {
        console.log(e);
    });
};

function controller (request, response) {
    switch (request.url) {
        case '/pairing':
            getPairing(request, response);
            break;
        case '/actions':
            getActions(request, response);
            break;
        case '/':
            postActions(request, response);
            break;
        default:
            respondNotFound(response);
    }
}

function getPairing (request, response) {
    if (request.method !== 'GET') {
        respondNotFound(response);
        return;
    }
    const data = JSON.stringify({
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'publicKey': Store.getPublicKey()
    });
    respondOkWithData(data);
}

function getActions (request, response) {
    if (request.method !== 'GET') {
        respondNotFound(response);
        return;
    }
    respondOkWithData(Actions.getActions());
}

function postActions (request, response) {
    if (request.method !== 'POST') {
        respondNotFound(response);
    }
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        const success = Actions.triggerWithPayload(JSON.parse(body));
        success ? respondOk(response) : respondForbidden(response);
    });
}

function respondOkWithData (response, data) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.write(data);
    response.end();
}

function respondOk (response) {
    response.statusCode = 200;
    response.end();
}

function respondForbidden (response) {
    response.statusCode = 403;
    response.end();
}

function respondNotFound (response) {
    response.statusCode = 404;
    response.end();
}

module.exports = methods;
