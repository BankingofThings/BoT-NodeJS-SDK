environment-debian: ; sudo bin/install.sh

install: ; npm install

reset: ; node lib/reset.js

tests: ; npm test

server: ; node lib/app.js $(makerID)

bottalk: ; node lib/bottalk-service.js

config: ; node lib/config.js $(key) $(value)
