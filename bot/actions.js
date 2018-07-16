'use strict';

const Utils = require('./utils');
const http = require('http');
const Communication = require('./communication');
const uuidv4 = require('uuid/v4');

var methods = {};

methods.refreshActions = function() {
    let makerID = Utils.makerID();
    Communication.getContent('actions', makerID, function(actions) {
        let stringActions = JSON.stringify(actions);
        Utils.setValueForKey('actions', stringActions);
    });
};

function getActions() {
    let stringActions = Utils.getValueForKey('actions');
    let actionsParsed = JSON.parse(stringActions);
    let actions = JSON.parse(actionsParsed);
    return actions;
}

function performAction(action, value, success) {
    let postData = JSON.stringify({
        'deviceID': Utils.botID(),
        'makerID': Utils.makerID(),
        'name': action.name,
        'value': value,
        'queueID': uuidv4()
    });

    Communication.post('actions', postData, function(success) {
        success(true);
    });
}

// Internal checks
function validActionFor(payload) {
    let localBotActions = getActions();
    for (let i = 0; i < localBotActions.length; ++i) {
        let action = localBotActions[i];
        if (action.name == payload.actionID) {
            return action;
            break;
        }
    }
    return undefined;
}

function isValidFrequency(frequency, lastTimestampForAction) {
    let now = Math.round((new Date()).getTime() / 1000);

    if (lastTimestampForAction === undefined) {
        return true;
    } else if (frequency == 'hourly') {
        return (now - lastTimestampForAction) > (3600);
    } else if (frequency == 'daily') {
        return (now - lastTimestampForAction) > (3600 * 24);
    } else if (frequency == 'weekly') {
        return (now - lastTimestampForAction) > ((3600 * 24) * 7);
    } else if (frequency == 'monthly') {
        return (now - lastTimestampForAction) > (((3600 * 24) * 7) * 4);
    } else if (frequency == 'yearly') {
        return (now - lastTimestampForAction) > ((3600 * 24) * 365);
    }
    return false;
}

function lastTimestampForAction(action) {
    let key = 'lastTrigger_' + action.name;
    let timestamp = Utils.getValueForKey(key);
    return timestamp;
}

function saveLastTimestampForAction(action) {
    let key = 'lastTrigger_' + action.name;
    let now = Math.round((new Date()).getTime() / 1000);
    Utils.setValueForKey(key, now);
}

methods.startServer = function() {
    var server = http.createServer(function(req, res) {
      if (req.method == 'GET') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        var response = "{}";
        if (req.url == "/pairing") {
          let qrData = JSON.stringify({
              'deviceID': Utils.botID(),
              'makerID': Utils.makerID(),
              'publicKey': Utils.getValueForKey('publicKey'),
          });
          response = qrData

      } else if (req.url == "/actions") {
        let stringActions = Utils.getValueForKey('actions');
        let actionsParsed = JSON.parse(stringActions);
        response = actionsParsed
      }
        res.write(response);
        res.end();
      } else if (req.method == 'POST') {
            let body = '';
            req.on('data', function(data) {
                body += data;
            });
            req.on('end', function() {
                let payload = JSON.parse(body);
                let value = payload.value;

                let action = validActionFor(payload);

                if (action !== undefined) {
                    let lastTriggerd = lastTimestampForAction(action);
                    if (isValidFrequency(action.frequency, lastTriggerd) == true) {
                        performAction(action, value, function(success) {
                            if (success == true) {
                                saveLastTimestampForAction(action);
                            }
                        });
                    } else {
                        console.log('Frequency not within range...');
                    }
                }
            });

            res.writeHead(200, {
                'Content-Type': 'text/html',
            });
            res.end('');
        } else {
            res.writeHead(503, {
                'Content-Type': 'text/html',
            });
            res.end('');
        }
    });
    server.listen(3001, '127.0.0.1');
    console.log('Starting local server');
};

module.exports = methods;
