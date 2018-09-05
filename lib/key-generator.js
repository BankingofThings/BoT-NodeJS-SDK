const uuidv4 = require('uuid/v4');
const keypair = require('keypair');

const keyGenerator = {};

keyGenerator.generateKeyPair = () => {
    let pair = keypair(1024);

    let publicKey = pair.public.replace('-----BEGIN RSA PUBLIC KEY-----\n', '');
    publicKey = publicKey.replace('\n-----END RSA PUBLIC KEY-----\n', '');

    const privateKey = pair.private;

    return {publicKey, privateKey};
};

keyGenerator.generateDeviceID = () => {
    return uuidv4();
};

module.exports = keyGenerator;
