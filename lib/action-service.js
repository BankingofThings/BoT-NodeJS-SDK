const BotService = require('./bot-service');
const Store = require('./store');

const uuidv4 = require('uuid/v4');
const HttpError = require('http-errors');

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
const MONTH_IN_SECONDS = WEEK_IN_SECONDS * 4;
const HALF_YEAR_IN_SECONDS = WEEK_IN_SECONDS * 26;
const YEAR_IN_SECONDS = WEEK_IN_SECONDS * 52;

const actionService = {};

actionService.trigger = (actionID, value) => {
    log('Triggering action: ' + actionID);
    validateAction(actionID);
    const body = createRequestBody(actionID, value);

    BotService.post('actions', body)
        .then(() => {
            saveLastTimestampForAction(actionID);
        })
        .catch(() => {
            // TODO : what should we do here?
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
    }
    return true; // when the frequency is 'always' or not implemented
}

function createRequestBody (actionID, value) {
    let data = {
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'name': actionID,
        'queueID': uuidv4()
    };

    if (value !== null) {
        data.value = value;
    }
    return data;
}

function saveLastTimestampForAction (actionID) {
    let now = Math.round((new Date()).getTime() / 1000);
    Store.setLastTriggeredAt(actionID, now);
}

function validateAction (actionID) {
    getActionByID(actionID)
        .then((action) => {
            if (!isValidFrequency(action)) {
                logError('Maximum `' + action.frequency + '` triggers reached');
                throw new HttpError(403, 'Invalid Frequency');
            }
        })
        .catch(() => {
            logError('Action not found');
            throw new HttpError(404, 'Action not found');
        });
}

function getActionByID (actionID) {
    return new Promise((resolve, reject) => {
        actionService.getActions()
            .then((actions) => {
                for (let i = 0; i < actions.length; ++i) {
                    const action = actions[i];
                    if (action.name === actionID) {
                        resolve(action);
                    }
                }
                reject();
            }).catch(() => reject());
    });
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
