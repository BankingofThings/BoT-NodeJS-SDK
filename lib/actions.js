const Store = require('./store');
const Communication = require('./communication');
const uuidv4 = require('uuid/v4');

const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
const MONTH_IN_SECONDS = WEEK_IN_SECONDS * 4;
const HALF_YEAR_IN_SECONDS = WEEK_IN_SECONDS * 26;
const YEAR_IN_SECONDS = WEEK_IN_SECONDS * 52;

let methods = {};

methods.triggerWithPayload = (payload) => {
    const action = validActionFor(payload);
    if (action === null || !this.isValidFrequency(action)) {
        return false;
    }
    const value = payload.hasOwnProperty('value') ? payload.value : null;
    this.triggerAction(action.name, value);
};

methods.refreshActions = () => {
    let makerID = Store.getMakerID();
    Communication.getContent('actions', makerID, (actions) => {
        Store.setActions(JSON.stringify(actions));
    });
};

methods.getActions = () => {
    console.log('Retrieving actions');
    let stringActions = Store.getActions();
    if (stringActions === undefined) {
        methods.refreshActions();
        stringActions = Store.getActions();
    }
    return JSON.parse(stringActions);
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

    Communication.post('actions', postData);
    this.saveLastTimestampForAction(action.name);
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

methods.saveLastTimestampForAction = (actionID) => {
    let now = Math.round((new Date()).getTime() / 1000);
    Store.setLastTriggeredAt(actionID, now);
};

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
