'use strict';

var Utils = require('./utils');
const querystring = require('querystring');
const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const baseURL = 'api.bankingofthings.io';
const PORT = 443;
const ENDPOINT = 'bot_iot';
const URL = baseURL;

const SSLFINGERPRINT = [
  '98:67:D8:29:37:E3:8C:2D:44:D5:C4:21:4B:D7:CB:DF:59:7A:CE:61'
];

var methods = {};

function validateToken(token, cb) {
	let cert = fs.readFileSync('public.pem');
	jwt.verify(token, cert, function(err, decoded) {
	  if (err) {
		  console.log('======= Decode Fail');
	     cb('');
	   } else {
	     cb(decoded.bot);
	   }
	});
}

function signToken(data) {
	let cert = Utils.getValueForKey('botPrvkey');
	let token = jwt.sign({bot: data}, cert, {algorithm: 'RS256'});
	return token;
}

methods.getJSON = async function(api, makerID) {
  return new Promise ( function(resolve, reject) {
    let options = {
  	  hostname: URL,
  	  port: PORT,
  	  path: '/' + ENDPOINT + '/' + api + '/' + makerID,
  	  method: 'GET',
  	  headers: {'makerID': Utils.makerID(),
  		   		'deviceID': Utils.botID(),
  	     			},
  	  agent: new https.Agent({
      	maxCachedSessions: 0
	  })
  	};

  		var req = https.get(options, (res) => {
  		  res.setEncoding('utf8');
  		  let body = '';

  		  res.on('data', (data) => {
  		    body += data;
  		  });

  		  res.on('end', () => {
  				let response = validateToken(body, function(response) {
  				resolve(response);
  				});
  		  });
  		});

      req.on('socket', socket => {
        socket.on('secureConnect', () => {
        var fingerprint = socket.getPeerCertificate().fingerprint;
        if(socket.authorized === false){
          req.emit('error', new Error(socket.authorizationError));
          return req.abort();
        }

        if(SSLFINGERPRINT.indexOf(fingerprint) === -1 && !socket.isSessionReused()){
          console.log('fingerprint'+ fingerprint);
          req.emit('error', new Error('Fingerprint does not match'));
          return req.abort();
        }
      });
    });
  })
}

methods.getContent = function(api, makerID, cb) {
	let options = {
	  hostname: URL,
	  port: PORT,
	  path: '/' + ENDPOINT + '/' + api + '/' + makerID,
	  method: 'GET',
	  headers: {'makerID': Utils.makerID(),
		   		    'deviceID': Utils.botID(),
	     		},
	  agent: new https.Agent({
	   maxCachedSessions: 0
	  })
	};

		var req = https.get(options, (res) => {
		  res.setEncoding('utf8');
		  let body = '';

		  res.on('data', (data) => {
		    body += data;
		  });

		  res.on('end', () => {
				let response = validateToken(body, function(response) {
          console.log('response' + response);

			    cb(response);
				});
		  });
		});

    req.on('socket', socket => {
      socket.on('secureConnect', () => {
      var fingerprint = socket.getPeerCertificate().fingerprint;
      if(socket.authorized === false){
        req.emit('error', new Error(socket.authorizationError));
        return req.abort();
      }

      if(SSLFINGERPRINT.indexOf(fingerprint) === -1){
        console.log('fingerprint'+ fingerprint);
        req.emit('error', new Error('Fingerprint does not match'));
        return req.abort();
      }
    });
  });
};


methods.post = function(endpoint, postData, completionHandler) {
let JWTData = JSON.stringify({'bot': signToken(postData)});
let options = {
  hostname: URL,
  port: PORT,
  path: '/bot_iot/'+ endpoint,
  method: 'POST',
  headers: {
       'Content-Type': 'application/json',
       'Connection': 'keep-alive',
       'Content-Length': Buffer.byteLength(JWTData),
	     'makerID': Utils.makerID(),
	     'deviceID': Utils.botID(),
     },
};

  let req = https.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(JWTData);
  req.end();
};

module.exports = methods;
