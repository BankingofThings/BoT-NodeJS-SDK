FROM balenalib/raspberrypi3-node:8.16.1
#FROM node:8.16.1
USER root
RUN mkdir -p /home/node/app/

WORKDIR /home/node/app

COPY ./ /home/node/app/BoT-NodeJS-SDK/
WORKDIR /home/node/app/BoT-NodeJS-SDK/
RUN ls
RUN npm install
RUN ls
EXPOSE 8080
CMD node /home/node/app/BoT-NodeJS-SDK/lib/app.js
#CMD npm start