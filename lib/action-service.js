const BotService = require('./bot-service');
const KeyGenerator = require('./key-generator');
const Logger = require('./logger');
const Store = require('./store');

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
const MONTH_IN_SECONDS = WEEK_IN_SECONDS * 4;
const HALF_YEAR_IN_SECONDS = WEEK_IN_SECONDS * 26;
const YEAR_IN_SECONDS = WEEK_IN_SECONDS * 52;

const logger = new Logger('Action Service');
const actionService = {};

actionService.trigger = (actionID, value) => {
    return new Promise((resolve, reject) => {
        logger.info('Triggering action: ' + actionID);
        validateAction(actionID)
            .then(() => {
                const body = createActionRequestBody(actionID, value);
                BotService.post('actions', body)
                    .then(() => {
                        logger.success('Action successfully triggered');
                        resolve();
                        saveLastTimestampForAction(actionID);
                    })
                    .catch(() => {
                        reject({
                            code: 500,
                            message: 'Error: Failed to trigger action.'
                        });
                        logger.error('Failed to trigger action with ' +
                            'actionID' + actionID);
                    });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

actionService.getActions = () => {
    logger.info('Retrieving actions...');
    return new Promise((resolve, reject) => {
        BotService.get('actions')
            .then((json) => {
                const actions = JSON.parse(json);
                logger.success(actions.length +
                    ' actions retrieved from server');
                Store.setActions(actions);
                resolve(actions);
            })
            .catch(() => {
                logger.error('Could not retrieve actions from server');
                logger.info('Loading locally stored actions...');
                const actions = Store.getActions();
                if (actions) {
                    logger.success(
                        actions.length +
                        ' actions retrieved from local storage'
                    );
                    resolve(actions);
                }
                reject();
            });
    });
};

function isValidActionFrequency (actionID, frequency) {
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

function createActionRequestBody (actionID, value) {
    const data = {
        'deviceID': Store.getDeviceID(),
        'actionID': actionID,
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
                if (!isValidActionFrequency(actionID, action.frequency)) {
                    logger.error(`Maximum ${action.frequency} triggers reached`);
                    reject({
                        code: 403,
                        message: 'Forbidden: Maximum trigger frequency reached.'
                    });
                }
                resolve();
            })
            .catch(() => {
                logger.error('Action not found');
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
        if (action.actionID === actionID) {
            return action;
        }
    }
}

module.exports = actionService;
