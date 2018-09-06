const Configuration = require('./configuration');
const Controller = require('./controller');

const http = require('http');

const HOST = '127.0.0.1';
const PORT = 3001;

const methods = {};

methods.startServer = () => {
    let server = http.createServer(Controller);
    server.listen(PORT, HOST);
    console.log('Bot: Starting local server, listening on port: ' + port);
    server.on('error', error => console.log(error));
    Configuration.resumeConfiguration();
};

module.exports = methods;
