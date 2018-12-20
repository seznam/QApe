[![Build Status](https://travis-ci.com/seznam/QApe.svg?branch=master)](https://travis-ci.com/seznam/QApe)
[![NPM](https://img.shields.io/npm/v/qape.svg)](https://nodei.co/npm/qape/)
[![NPM](https://img.shields.io/badge/powered%20by-puppeteer-blue.svg)](https://github.com/GoogleChrome/puppeteer)

![QApe presentation](https://user-images.githubusercontent.com/755134/49812102-f2fca280-fd64-11e8-84de-3a1bac422216.gif)

QApe is autonomous testing tool, which acts as a manual tester browsing your website, clicking anything it can and reporting any errors it finds with exact steps, how to reproduce it. It also automatically generates a script for regression test, which you can add to set of defined scenarios for QApe, so you will have regression test for every error it finds! The longer the QApe is testing your website, the more potentially problematic scenarios it knows and re-tests them with each run without any work from your side!

## Links
- [How to create custom reporter?](./examples/Reporters.md)
- [Project documentation](./documentation/index.html)

## Give It a Try!
Take a look how QApe works!

```
npx qape --headless-mode-disabled -u https://www.example.com
```

## Get Started
Simply install the latest version via npm install

```
npm install qape
```

Than you can run QApe like this

```
node_modules/.bin/qape -u https://www.example.com
```

By default, QApe saves all scenarios causing an error to `report` folder. You can replay these scenarios like this

```
node_modules/.bin/qape report/*minified.json -p
```

Display available options like this

```
node_modules/.bin/qape --help
```

## Development
Build from source
```
npm run build
```
Build from source with watch
```
npm run dev
```
Run unit tests
```
npm test
```
Run local testing website (from example)
```
node server.js
```
Start local version of qape with source mapping
```
npm start -- [options]
```
