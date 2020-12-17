const Logger = require('./logger');
const Store = require('./store');

const https = require('https');
const jwt = require('jsonwebtoken');

const HOST = 'iot.bankingofthings.io';
const PORT = 443;
const ENCODING_UTF8 = 'utf8';

const SSL_FINGERPRINT = [
    '96:CC:4C:F0:74:23:0D:01:FF:B9:20:8C:D7:4E:4C:46:1C:E5:81:7C'
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
                let responseBody = {};
                //Handle error from Server
                if (response.statusCode > 299)  {
                  responseBody.statusCode = response.statusCode;
                  responseBody.message = data;
                  reject(responseBody);
                }
                //Resolve the response from server
                resolve(data);
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
            let payload = '';
            response.on('data', (chunk) => {
                payload += chunk;
            });
            response.on('end', () => {
              const data = decodeToken(payload);
              let responseBody = {};
              //Handle error from Server
              if (response.statusCode > 299){
                responseBody.statusCode = response.statusCode;
                responseBody.message = data;
                reject(responseBody);
              }
              //Resolve the response from server
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
      throw new Error('Invalid Response. Missing key `bot` in response JSON');
    } catch (error) {
      logger.error('Unable to decode response from BoT server.');
      throw new Error('Unable to decode response from BoT server.');
    }
}

function createGetRequest (resource) {
    return {
        hostname: HOST,
        port: PORT,
        path: resource,
        headers: {
            'makerID': Store.getMakerOrProductID(),
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
            'makerID': Store.getMakerOrProductID(),
            'deviceID': Store.getDeviceID()
        }
    };
}

function handleErrors (request, reject) {
    request.on('error', (error) => {
        logger.error('A problem has occurred while sending the request. ' +
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
