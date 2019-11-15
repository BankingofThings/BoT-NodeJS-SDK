const Logger = require('./logger');
const Store = require('./store');

const https = require('https');
const jwt = require('jsonwebtoken');

const HOST = 'iot.bankingofthings.io';
const PORT = 443;
const ENCODING_UTF8 = 'utf8';

const SSL_FINGERPRINT = [
    '76:E6:B6:DF:6D:3B:4D:2D:48:D1:B6:32:AD:D6:8E:80:53:3F:5F:88'
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
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                if (response.statusCode !== 200) {
                    return reject();
                }
                if (body === '') {
                    return resolve('{}');
                }
                const data = decodeToken(body);
                if (data === undefined) {
                    return reject();
                }
                resolve(data);
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
        path: resource,
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
        path: resource,
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
