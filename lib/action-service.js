const BotService = require('./bot-service');
const KeyGenerator = require('./key-generator');
const Store = require('./store');

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
const MONTH_IN_SECONDS = WEEK_IN_SECONDS * 4;
const HALF_YEAR_IN_SECONDS = WEEK_IN_SECONDS * 26;
const YEAR_IN_SECONDS = WEEK_IN_SECONDS * 52;

const actionService = {};

actionService.trigger = (actionID, value) => {
    return new Promise((resolve, reject) => {
        log('Triggering action: ' + actionID);
        validateAction(actionID)
            .then(() => {
                const body = createRequestBody(actionID, value);
                BotService.post('actions', body)
                    .then(() => {
                        logSuccess('Action successfully triggered');
                        resolve();
                        saveLastTimestampForAction(actionID);
                    })
                    .catch(() => {
                        reject({
                            code: 500,
                            message: 'Error: Failed to trigger action.'
                        });
                        logError('Error while triggering action: ' + actionID);
                    });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

actionService.getActions = () => {
    log('Retrieving actions...');
    return new Promise((resolve, reject) => {
        BotService.get('actions/' + Store.getMakerID())
            .then((json) => {
                const actions = JSON.parse(json);
                logSuccess(actions.length + ' actions retrieved from server');
                Store.setActions(actions);
                resolve(actions);
            })
            .catch(() => {
                logError('Could not retrieve actions from server');
                log('Loading locally stored actions...');
                const actions = Store.getActions();
                if (actions) {
                    logSuccess(
                        actions.length +
                        ' actions retrieved from local storage'
                    );
                    resolve(actions);
                }
                reject();
            });
    });
};

function isValidFrequency (actionID, frequency) {
    let lastTriggeredAt = Store.getLastTriggeredAt(actionID);
    if (lastTriggeredAt === undefined) {
        return true;
    }
    const now = Math.round((new Date()).getTime() / 1000);
    const secondsSinceLastTriggered = now - lastTriggeredAt;

    switch (frequency) {
        case 'minutely':
            return secondsSinceLastTriggered > MINUTE_IN_SECONDS;
        case 'hourly':
            return secondsSinceLastTriggered > HOUR_IN_SECONDS;
        case 'daily':
            return secondsSinceLastTriggered > DAY_IN_SECONDS;
        case 'weekly':
            return secondsSinceLastTriggered > WEEK_IN_SECONDS;
        case 'monthly':
            return secondsSinceLastTriggered > MONTH_IN_SECONDS;
        case 'half-yearly':
            return secondsSinceLastTriggered > HALF_YEAR_IN_SECONDS;
        case 'yearly':
            return secondsSinceLastTriggered > YEAR_IN_SECONDS;
        case 'always':
        default:
            return true;
    }
}

function createRequestBody (actionID, value) {
    const data = {
        'deviceID': Store.getDeviceID(),
        'name': actionID,
        'queueID': KeyGenerator.generateQueueID()
    };
    if (value !== undefined && value !== null) {
        data.value = value;
    }
    return data;
}

function saveLastTimestampForAction (actionID) {
    const now = Math.round((new Date()).getTime() / 1000);
    Store.setLastTriggeredAt(actionID, now);
}

function validateAction (actionID) {
    return new Promise((resolve, reject) => {
        getActionByID(actionID)
            .then((action) => {
                if (!isValidFrequency(actionID, action.frequency)) {
                    logError(
                        'Maximum `' + action.frequency + '` triggers reached'
                    );
                    reject({
                        code: 403,
                        message: 'Forbidden: Maximum trigger frequency reached.'
                    });
                }
                resolve();
            })
            .catch(() => {
                logError('Action not found');
                reject({code: 404, message: 'Action not found'});
            });
    });
}

function getActionByID (actionID) {
    return new Promise((resolve, reject) => {
        actionService.getActions()
            .then((actions) => {
                const action = findAction(actions, actionID);
                action === undefined ? reject() : resolve(action);
            }).catch(() => reject());
    });
}

function findAction (actions, actionID) {
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        // TODO : rename to action.actionID when renamed in the Core
        if (action.name === actionID) {
            return action;
        }
    }
}

function log (message) {
    console.log('Action Service:', message);
}

function logSuccess (message) {
    console.log('\x1b[32m' + 'Action Service:', message, '\x1b[39m');
}

function logError (message) {
    console.log('\x1b[31m' + 'Action Service:', message, '\x1b[39m');
}

module.exports = actionService;
