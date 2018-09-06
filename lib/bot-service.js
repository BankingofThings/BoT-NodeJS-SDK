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

let methods = {};

function validateToken (token) {
    return new Promise((resolve, reject) => {
        let publicKey = Store.getApiPublicKey();
        jwt.verify(token, publicKey, function (error, decoded) {
            if (error) {
                console.log('Error: Could not decode message from server.');
                reject();
            } else {
                resolve(decoded.bot);
            }
        });
    });
}

function signToken (data) {
    let cert = Store.getPrivateKey();
    return jwt.sign({bot: data}, cert, {algorithm: 'RS256'});
}

methods.getJSON = async function (api, makerID) {
    return new Promise(function (resolve, reject) {
        let options = {
            hostname: HOST,
            port: PORT,
            path: ENDPOINT_PREFIX + api + '/' + makerID,
            method: 'GET',
            headers: {
                'makerID': Store.getMakerID(),
                'deviceID': Store.getDeviceID()
            },
            agent: new https.Agent({
                maxCachedSessions: 0
            })
        };

        let request = https.get(options, (response) => {
            response.setEncoding('utf8');
            let body = '';

            response.on('data', (data) => {
                body += data;
            });

            response.on('end', () => {
                validateToken(body).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            });
        });
        verifyFingerprint(request);
    });
};

methods.get = async (resource) => {
    return await new Promise((resolve) => {
        const request = createRequest(resource);
        https.get(request, (response) => {
            response.setEncoding(ENCODING_UTF8);
            let body = '';
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                const data = decodeToken(token);
                resolve(data);
            });
        });
    });
};

function decodeToken (token) {
    try {
        return jwt.verify(token, Store.getApiPublicKey());
    } catch (error) {
        console.log('Error: Could not decode message from server.');
    }
}

function createRequest (resource) {
    const makerID = Store.getMakerID();
    return {
        hostname: HOST,
        port: PORT,
        path: ENDPOINT_PREFIX + resource + '/' + makerID,
        method: 'GET',
        headers: {
            'makerID': makerID,
            'deviceID': Store.getDeviceID()
        },
        agent: new https.Agent({
            maxCachedSessions: 0
        })
    };
}

methods.getContent = (api, makerID, cb) => {
    let options = {
        hostname: HOST,
        port: PORT,
        path: '/' + ENDPOINT_PREFIX + '/' + api + '/' + makerID,
        method: 'GET',
        headers: {
            'makerID': Store.getMakerID(),
            'deviceID': Store.getDeviceID()
        },
        agent: new https.Agent({
            maxCachedSessions: 0
        })
    };

    let req = https.get(options, (res) => {
        res.setEncoding('utf8');
        let body = '';

        res.on('data', (data) => {
            body += data;
        });

        res.on('end', () => {
            validateToken(body, function (response) {
                cb(response);
            });
        });
    });
    verifyFingerprint(req);
};

methods.post = (endpoint, body) => {
    let JWTData = JSON.stringify({'bot': signToken(body)});
    let options = {
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

    let req = https.request(options, (res) => {
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });
    verifyFingerprint(req);

    req.on('error', (e) => {
        console.error(e);
    });
    req.write(JWTData);

    req.end();
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

module.exports = methods;
