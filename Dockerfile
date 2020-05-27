FROM balenalib/raspberrypi3-node:8.16.1
#FROM node:8.16.1

#ENV PRODUCT_ID "35cd6289-21fe-44cd-8482-18c03068a348"

USER root
RUN mkdir -p /home/node/app/

WORKDIR /home/node/app

COPY ./ /home/node/app/BoT-NodeJS-SDK/
WORKDIR /home/node/app/BoT-NodeJS-SDK/
RUN ls
RUN npm install
RUN ls
EXPOSE 8080

RUN echo $PRODUCT_ID

CMD node /home/node/app/BoT-NodeJS-SDK/lib/app.js $PRODUCT_ID
#CMD npm start
