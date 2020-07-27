const BotService = require('./bot-service');
const KeyGenerator = require('./key-generator');
const Logger = require('./logger');
const Store = require('./store');
const DeviceStatus = require('./device-status');
const ActionService = require('./action-service');


const logger = new Logger('BotTalk Service');
const bottalkService = {};

bottalkService.getMessages = () => {
    return new Promise((resolve, reject) => {
        BotService.get('/messages')
            .then((json) => {
                const messages = JSON.parse(json);
                logger.success(messages.length +
                    ' messages retrieved from server');
                resolve(messages);
            })
            .catch(() => {
                reject();
            });
    });
};

bottalkService.fetchMessages = () => {
    bottalkService.getMessages()
        .then((messages) => {
        const event = messages['event'];
        const payload = JSON.parse(messages['payload']);        
        const actionID = payload['actionID']
        const customerID = payload['customerID']
          
        bottalkService.executeExternalScript();

        bottalkService.triggerAction(actionID, "", customerID ) 
             logger.error('Retrieved messages from server');           
        })
        .catch(() => {
            bottalkService.fetchMessages();
        });
}
 
bottalkService.triggerAction = (actionID, value,alternativeID ) => {
    logger.error('Triggering Action actionID' + actionID);
    ActionService.trigger(actionID, value, alternativeID)
    .then((json) => {
        logger.error("Triggering action succes");
        
    })
    .catch(({code, message}) => {
        logger.error("Triggering action faild");
    });
}

bottalkService.executeExternalScript = () => {
    const { spawn } = require('child_process');
    
    const exampleScript = '/home/pi/myExampleScript.sh';
    const pyProg = spawn('python', [exampleScript]);
    pyProg.stdout.on('data', function(data) {
        console.log(data.toString());
        res.write(data);
        res.end('end');
    });
    bottalkService.fetchMessages();
}
        
bottalkService.fetchMessages();
module.exports = bottalkService;
