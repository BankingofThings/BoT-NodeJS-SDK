const Logger = require('./logger');
const Store = require('./store');

const https = require('https');
const jwt = require('jsonwebtoken');

const HOST = 'api.bankingofthings.io';
const PORT = 443;
const ENDPOINT_PREFIX = '/bot_iot/';
const ENCODING_UTF8 = 'utf8';

const SSL_FINGERPRINT = [
    '98:67:D8:29:37:E3:8C:2D:44:D5:C4:21:4B:D7:CB:DF:59:7A:CE:61'
];

const logger = new Logger('BoT Service');
const botService = {};

botService.get = async (resource) => {
    return new Promise((resolve, reject) => {
        const parameters = createGetRequest(resource);
        const request = https.get(parameters, (response) => {
            response.setEncoding(ENCODING_UTF8);
            let body = '';
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                const data = decodeToken(body);
                data === undefined ? reject() : resolve(data);
            });
        });
        handleErrors(request, reject);
        verifyFingerprint(request);
    });
};

botService.post = async (resource, data) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({bot: signToken(data)});
        const parameters = createPostRequest(resource, body);

        let request = https.request(parameters, (response) => {
            let body = '';
            // Not using body because for triggering action body is empty
            // We have to read it out here, or it will not reach the 'end' event
            response.on('data', (chunk) => body += chunk);

            response.on('end', () => {
                response.statusCode === 200 ? resolve() : reject();
            });
        });
        verifyFingerprint(request);
        handleErrors(request, reject);
        request.write(body);
        request.end();
    });
};

function decodeToken (token) {
    try {
        const decoded = jwt.verify(token, Store.getApiPublicKey());
        if (decoded.hasOwnProperty('bot')) {
            return decoded.bot;
        }
        logger.error('Invalid Response. Missing key `bot` in response JSON');
    } catch (error) {
        logger.error('Unable to decode response from BoT server.');
    }
}

function createGetRequest (resource) {
    return {
        hostname: HOST,
        port: PORT,
        path: ENDPOINT_PREFIX + resource,
        headers: {
            'makerID': Store.getMakerID(),
            'deviceID': Store.getDeviceID()
        },
        agent: new https.Agent({
            maxCachedSessions: 0
        })
    };
}

function createPostRequest (resource, body) {
    return {
        hostname: HOST,
        port: PORT,
        path: ENDPOINT_PREFIX + resource,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Content-Length': Buffer.byteLength(body),
            'makerID': Store.getMakerID(),
            'deviceID': Store.getDeviceID()
        }
    };
}

function handleErrors (request, reject) {
    request.on('error', (error) => {
        logger.error('A problem has occurred while sending POST request. ' +
            error);
        reject();
    });
}

function verifyFingerprint (request) {
    request.on('socket', (socket) => {
        socket.on('secureConnect', () => {
            let fingerprint = socket.getPeerCertificate().fingerprint;
            if (socket.authorized === false) {
                request.emit('error', new Error(socket.authorizationError));
                return request.abort();
            }

            if (
                SSL_FINGERPRINT.indexOf(fingerprint) === -1 &&
                !socket.isSessionReused()
            ) {
                request.emit('error', new Error('Fingerprint does not match'));
                return request.abort();
            }
        });
    });
}

function signToken (data) {
    return jwt.sign({bot: data}, Store.getPrivateKey(), {algorithm: 'RS256'});
}

module.exports = botService;
