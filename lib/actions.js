'use strict';

const Store = require('./store');
const http = require('http');
const Communication = require('./communication');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

let methods = {};

methods.refreshActions = function () {
    let makerID = Store.getMakerID();
    Communication.getContent('actions', makerID, function (actions) {
        Store.setActions(JSON.stringify(actions));
    });
};

function getActions () {
    console.log('Retrieving actions');
    let stringActions = Store.getActions();
    if (stringActions === undefined) {
        methods.refreshActions();
        stringActions = Store.getActions();
    }
    return JSON.parse(stringActions);
}

function performAction (actionID, value) {
    let postData = {
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'name': actionID,
        'queueID': uuidv4()
    };

    if (value !== null) {
        postData.value = value;
    }

    Communication.post('actions', postData);
    saveLastTimestampForAction(action.name);
}

// Internal checks
function validActionFor (payload) {
    let actions = getActions();

    for (let i = 0; i < actions.length; ++i) {
        let action = actions[i];
        if (action.name === payload.actionID) {
            return action;
        }
    }
    return null;
}

function isValidFrequency (frequency, lastTimestampForAction) {
    let now = Math.round((new Date()).getTime() / 1000);

    if (lastTimestampForAction === undefined) {
        return true;
    }
    switch (frequency) {
        case 'hourly':
            return (now - lastTimestampForAction) > (3600);
        case 'daily':
            return (now - lastTimestampForAction) > (3600 * 24);
        case 'weekly':
            return (now - lastTimestampForAction) > (3600 * 24 * 7);
        case 'monthly':
            return (now - lastTimestampForAction) > (3600 * 24 * 7 * 4);
        case 'yearly':
            return (now - lastTimestampForAction) > (3600 * 24 * 365);
    }
    return false;
}

function saveLastTimestampForAction (actionID) {
    let now = Math.round((new Date()).getTime() / 1000);
    Store.setLastTriggeredAt(actionID, now);
}

methods.startServer = function () {
    let server = http.createServer(function (req, res) {
        if (req.method === 'GET') {
            res.writeHead(200, {'Content-Type': 'application/json'});
            let response = '{}';
            if (req.url === '/pairing') {
                response = JSON.stringify({
                    'deviceID': Store.getDeviceID(),
                    'makerID': Store.getMakerID(),
                    'publicKey': Store.getPublicKey()
                });
            } else if (req.url === '/pairing/qr.png') {
                let img = fs.readFileSync('./qr.png');
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(img, 'binary');
            } else if (req.url === '/actions') {
                response = getActions();
            }
            res.write(response);
            res.end();
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                let payload = JSON.parse(body);
                let action = validActionFor(payload);

                if (action !== null) {
                    let lastTriggeredAt = Store.getLastTriggeredAt(action.name);
                    if (isValidFrequency(action.frequency, lastTriggeredAt)) {
                        performAction(
                            action.name,
                            payload.hasOwnProperty('value')
                                ? payload.value
                                : null
                        );
                    } else {
                        console.log('Error: Action not allowed at this time ' +
                            'with the current frequency. Maximum number of ' +
                            'actions per ' + action.frequency + ' reached.');
                    }
                }
            });
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('');
        } else {
            res.writeHead(503, {'Content-Type': 'text/html'});
            res.end('');
        }
    });
    let port = 3001;
    server.listen(port, '127.0.0.1');
    console.log('Bot: Starting local server, listening on port: ' + port);

    server.on('error', function (e) {
        console.log(e);
    });
};

module.exports = methods;
