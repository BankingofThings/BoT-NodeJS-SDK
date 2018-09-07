const Controller = require('./controller');

const express = require('express');

const PORT = 3001;

const methods = {};

methods.startServer = () => {
    const app = express();

    app.get('/pairing', (request, response) => {
        Controller.getPairing(request, response);
    });

    app.get('/actions', (request, response) => {
        Controller.getActions(request, response);
    });

    app.post('/actions', (request, response) => {
        Controller.postActions(request, response);
    });

    app.listen(PORT, () => {
        console.log('BoT: Server started, listening on port: ' + PORT);
    });
};

module.exports = methods;
