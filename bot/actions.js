'use strict';

const Utils = require('./utils');
const http = require('http');
const Communication = require('./communication');
const uuidv4 = require('uuid/v4');
const fs = require('fs');

let methods = {};

methods.refreshActions = function () {
    let makerID = Utils.makerID();
    Communication.getContent('actions', makerID, function (actions) {
        let stringActions = JSON.stringify(actions);
        Utils.setValueForKey('actions', stringActions);
    });
};

function getActions() {
    console.log('Retrieving actions');
    let stringActions = Utils.getValueForKey('actions');
    let actionsParsed = JSON.parse(stringActions);
    return JSON.parse(actionsParsed);
}

function performAction(action, success, value) {
    let postData = {
        'deviceID': Utils.botID(),
        'makerID': Utils.makerID(),
        'name': action.name,
        'queueID': uuidv4()
    };

    if (value !== null) {
        postData.value = value;
    }

    Communication.post('actions', postData, function (success) {
        success(true);
    });
}

// Internal checks
function validActionFor(payload) {
    let localBotActions = getActions();

    for (let i = 0; i < localBotActions.length; ++i) {
        let action = localBotActions[i];
        if (action.name === payload.actionID) {
            return action;
        }
    }
    return null;
}

// Shouldn't we do this on the server?
function isValidFrequency(frequency, lastTimestampForAction) {
    let now = Math.round((new Date()).getTime() / 1000);

    if (lastTimestampForAction === undefined) {
        return true;
    }
    switch (frequency) {
        case 'hourly':
            return (now - lastTimestampForAction) > (3600);
        case 'daily':
            return (now - lastTimestampForAction) > (3600 * 24);
        case'weekly':
            return (now - lastTimestampForAction) > ((3600 * 24) * 7);
        case 'monthly':
            return (now - lastTimestampForAction) > (((3600 * 24) * 7) * 4);
        case 'yearly':
            return (now - lastTimestampForAction) > ((3600 * 24) * 365);
    }
    return false;
}

function lastTimestampForAction(action) {
    let key = 'lastTrigger_' + action.name;
    return Utils.getValueForKey(key);
}

function saveLastTimestampForAction(action) {
    let key = 'lastTrigger_' + action.name;
    let now = Math.round((new Date()).getTime() / 1000);
    Utils.setValueForKey(key, now);
}

methods.startServer = function () {
    var server = http.createServer(function (req, res) {
        if (req.method === 'GET') {
            res.writeHead(200, {'Content-Type': 'application/json'});
            let response = "{}";
            if (req.url === "/pairing") {
                response = JSON.stringify({
                    'deviceID': Utils.botID(),
                    'makerID': Utils.makerID(),
                    'publicKey': Utils.getValueForKey('publicKey'),
                });
            } else if (req.url === '/pairing/qr.png') {
                var img = fs.readFileSync('./qr.png');
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.end(img, 'binary');
            } else if (req.url === "/actions") {
                let stringActions = Utils.getValueForKey('actions');
                response = JSON.parse(stringActions);
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

                if (action != null) {
                    let lastTriggered = lastTimestampForAction(action);
                    if (isValidFrequency(action.frequency, lastTriggered)) {
                        performAction(
                            action,
                            function (success) {
                                if (success) {
                                    saveLastTimestampForAction(action);
                                }
                            },
                            payload.hasOwnProperty('value') ? payload.value : null
                        );
                    } else {
                        console.log('Error: Action not allowed at this time current frequency. Maximum number of actions per ' + action.frequency + ' reached.');
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
    let internalPort = 3001;
    server.listen(internalPort, '127.0.0.1');
    console.log('Bot: Starting local server, listening on port: ' + internalPort);

    server.on('error', function (e) {
        console.log(e);
    });
};

module.exports = methods;
