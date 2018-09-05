'use strict';

const Store = require('./store');
const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const baseURL = 'api.bankingofthings.io';
const PORT = 443;
const ENDPOINT = 'bot_iot';
const URL = baseURL;

const SSLFINGERPRINT = [
    '98:67:D8:29:37:E3:8C:2D:44:D5:C4:21:4B:D7:CB:DF:59:7A:CE:61'
];

let methods = {};

function validateToken (token, cb) {
    let cert = fs.readFileSync('public.pem');
    jwt.verify(token, cert, function (err, decoded) {
        if (err) {
            console.log('======= Decode Fail');
            cb('');
        } else {
            cb(decoded.bot);
        }
    });
}

function signToken (data) {
    let cert = Store.getPrivateKey();
    return jwt.sign({bot: data}, cert, {algorithm: 'RS256'});
}

methods.getJSON = async function (api, makerID) {
    return new Promise(function (resolve, reject) {
        let options = {
            hostname: URL,
            port: PORT,
            path: '/' + ENDPOINT + '/' + api + '/' + makerID,
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
                    resolve(response);
                });
            });
        });

        req.on('socket', (socket) => {
            socket.on('secureConnect', () => {
                let fingerprint = socket.getPeerCertificate().fingerprint;
                if (socket.authorized === false) {
                    req.emit('error', new Error(socket.authorizationError));
                    return req.abort();
                }

                if (
                    SSLFINGERPRINT.indexOf(fingerprint) === -1 &&
                    !socket.isSessionReused()
                ) {
                    req.emit('error', new Error('Fingerprint does not match'));
                    return req.abort();
                }
            });
        });
    });
};

methods.getContent = function (api, makerID, cb) {
    let options = {
        hostname: URL,
        port: PORT,
        path: '/' + ENDPOINT + '/' + api + '/' + makerID,
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

    req.on('socket', (socket) => {
        socket.on('secureConnect', () => {
            let fingerprint = socket.getPeerCertificate().fingerprint;
            if (socket.authorized === false) {
                req.emit('error', new Error(socket.authorizationError));
                return req.abort();
            }

            if (SSLFINGERPRINT.indexOf(fingerprint) === -1) {
                req.emit('error', new Error('Fingerprint does not match'));
                return req.abort();
            }
        });
    });
};


methods.post = function (endpoint, body) {
    let JWTData = JSON.stringify({'bot': signToken(body)});
    let options = {
        hostname: URL,
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

    req.on('error', (e) => {
        console.error(e);
    });

    req.write(JWTData);
    req.end();
};

module.exports = methods;
