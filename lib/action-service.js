const BoTService = require('./bot-service');
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

const methods = {};

methods.triggerWithPayload = (payload) => {
    const action = validActionFor(payload);
    if (action === null || !methods.isValidFrequency(action)) {
        throw new HttpError(403, 'Invalid Frequency');
    }
    const value = payload.hasOwnProperty('value') ? payload.value : null;
    methods.triggerAction(action.name, value);
};

methods.getActions = () => {
    console.log('Action Service: Retrieving actions...');
    let actions = retrieveActions();
    if (actions) {
        Store.setActions(actions);
        return actions;
    }
    actions = Store.getActions();

    return actions ? actions : {};
};

methods.triggerAction = (actionID, value) => {
    let postData = {
        'deviceID': Store.getDeviceID(),
        'makerID': Store.getMakerID(),
        'name': actionID,
        'queueID': uuidv4()
    };

    if (value !== null) {
        postData.value = value;
    }

    BoTService.post('actions', postData);
    saveLastTimestampForAction(action.name);
};

methods.isValidFrequency = (actionID, frequency) => {
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
};

function saveLastTimestampForAction (actionID) {
    let now = Math.round((new Date()).getTime() / 1000);
    Store.setLastTriggeredAt(actionID, now);
};

function retrieveActions () {
    BoTService.get('actions/' + Store.getMakerID());
    // TODO : Handle promise, resolve with (actions) and reject log
}

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

module.exports = methods;
