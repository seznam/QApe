FROM node:8-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN mkdir -p /home/qape

WORKDIR /home/qape

ADD package.json .

RUN npm install

ADD . .

RUN npm run build
