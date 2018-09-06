environment-debian: ; sudo bin/install.sh

install: ; npm install

tests: ; npm test

server: ; node lib/app.js $(makerID)
