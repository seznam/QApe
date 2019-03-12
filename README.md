# QApe
[![Build Status](https://travis-ci.com/seznam/QApe.svg?branch=master)](https://travis-ci.com/seznam/QApe)
[![NPM](https://img.shields.io/npm/v/qape.svg)](https://nodei.co/npm/qape/)
[![NPM](https://img.shields.io/badge/powered%20by-puppeteer-blue.svg)](https://github.com/GoogleChrome/puppeteer)

![QApe presentation](https://user-images.githubusercontent.com/755134/49812102-f2fca280-fd64-11e8-84de-3a1bac422216.gif)

QApe is autonomous testing tool, which acts as a manual tester browsing your website, clicking anything it can and reporting any errors it finds with exact steps, how to reproduce it. It also automatically generates a script for regression test, which you can add to set of defined scenarios for QApe, so you will have regression test for every error it finds! The longer the QApe is testing your website, the more potentially problematic scenarios it knows and re-tests them with each run without any work from your side!

## Give It a Try!
Take a look how QApe works!

```bash
npx qape --headless-mode-disabled -u https://www.example.com
```

## Get Started
Install QApe as local dependency
```bash
npm install --save-dev qape
```

Than you can run it like this
```bash
node_modules/.bin/qape -u https://www.example.com
```
*Pass `--headless-mode-disabled` argument to watch QApe in action.*

## Preview Results
By default, QApe saves all scenarios causing an error to `report` folder. Reproducible errors are saved in format `*-minified.json`. Non-reproducible errors are saved in format `*-not-reproduced.json`. You can replay any of these scenarios like this
```bash
node_modules/.bin/qape --preview-mode report/*
```

## Run QApe in Docker
You can use pre-built QApe docker image. Just set volumes to your report dir and you can pass any QApe CLI arguments at the end of docker run command and it will be passed to QApe inside. See example below.

`docker run -v report:/home/qape/report qape/qape:latest --url https://www.docker.com`

## Guides
- [Setup configuration file](./docs/Config.md)
- [Create custom reporters]('./docs/Reporters.md')

## Developers
- [Project documentation](./docs/devs/Documentation.md)
- [Development guide](./docs/devs/Development.md)
