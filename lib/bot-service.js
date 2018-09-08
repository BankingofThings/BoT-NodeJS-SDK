const Store = require('./store');

const https = require('https');
const jwt = require('jsonwebtoken');

const HOST = 'api-dev.bankingofthings.io'; // TODO : revert before PR merge
const PORT = 443;
const ENDPOINT_PREFIX = '/bot_iot/';
const ENCODING_UTF8 = 'utf8';

const SSL_FINGERPRINT = [
    '98:67:D8:29:37:E3:8C:2D:44:D5:C4:21:4B:D7:CB:DF:59:7A:CE:61'
];

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
        verifyFingerprint(request);
    });
};

function decodeToken (token) {
    try {
        const decoded = jwt.verify(token, Store.getApiPublicKey());
        if (decoded.hasOwnProperty('bot')) {
            return decoded.bot;
        }
        logError('Invalid Response. Missing key `bot` in response JSON');
    } catch (error) {
        logError('Could not decode response. Error: ' + error);
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

botService.post = (endpoint, body) => {
    const JWTData = JSON.stringify({'bot': signToken(body)});
    const options = {
        hostname: HOST,
        port: PORT,
        path: '/bot_iot/' + endpoint,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Connection': 'keep-alive',
            'Content-Length': Buffer.byteLength(JWTData),
            'makerID': Store.getMakerID(),
            'deviceID': Store.getDeviceID()
        }
    };

    let request = https.request(options, (response) => {
        response.on('data', (d) => {
            process.stdout.write(d);
        });
    });
    verifyFingerprint(request);

    request.on('error', (e) => {
        console.error(e);
    });
    request.write(JWTData);

    request.end();
};

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
                // TODO : Check if this is needed in all cases
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

function logError (message) {
    console.log('\x1b[31m' + 'BoT Service:', message, '\x1b[39m');
}

module.exports = botService;
