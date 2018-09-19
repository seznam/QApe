FROM node:8-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN mkdir -p /home/opicak

WORKDIR /home/opicak

ADD package.json .

RUN npm install

ADD . .

RUN npm run build
