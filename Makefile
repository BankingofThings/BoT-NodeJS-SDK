environment-debian: ; sudo ./install.sh

install: ; npm install

tests: ; npm test

server: ; node lib/bot.js $(makerID)
