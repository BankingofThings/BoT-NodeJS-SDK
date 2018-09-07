const Controller = require('./controller');

const express = require('express');
const httpError = require('http-errors');

const PORT = 3001;
const ERROR_START = '\x1b[31mERROR:'; // Red terminal color
const ERROR_END = '\x1b[39m'; // Default terminal color

const methods = {};

methods.startServer = () => {
    const app = express();

    app.use((request, response, next) => {
        console.log(
            'Server: Incoming request:', request.method, request.url);
        next();
    });

    app.get('/pairing', (request, response) => {
        Controller.getPairing(request, response);
    });

    app.get('/actions', (request, response) => {
        Controller.getActions(request, response);
    });

    app.post('/actions', (request, response) => {
        Controller.postActions(request, response);
    });

    app.use((request, response) => {
        throw new httpError(404, 'Invalid Route: ' + request.url);
    });

    app.use((error, request, response, next) => {
        console.log(
            ERROR_START,
            error.statusCode, error.message,
            ERROR_END
        );
        response.status(error.statusCode).json({message: error.message});
    });

    app.listen(PORT, () => {
        console.log('BoT: Server started, listening on port: ' + PORT);
    });
};

module.exports = methods;
