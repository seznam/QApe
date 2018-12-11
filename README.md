*QApe is in alpha phase and still requires a lot of work. You can try it out, but expect breaking changes even between patch releases. Beta phase will be initialized via minor release and production phase will be initialized via major release.*

# QApe
[![Build Status](https://travis-ci.com/seznam/qape.svg?branch=master)](https://travis-ci.com/seznam/qape)
[![NPM](https://img.shields.io/npm/v/qape.svg)](https://nodei.co/npm/qape/)

![QApe presentation](https://user-images.githubusercontent.com/755134/49812102-f2fca280-fd64-11e8-84de-3a1bac422216.gif)

QApe is autonomous testing tool, which acts as a manual tester browsing your website, clicking anything it can and reporting any errors it finds with exact steps, how to reproduce it. It also automatically generates a script for regression test, which you can add to set of defined scenarios for QApe, so you will never make the same bug twice! The longer the QApe is testing your website, the more potentially problematic scenarios it knows and re-tests them with each run without any work from your side!

## Install
Simply install the latest version via npm install
```
npm install qape
```

Than you can run qape like this
```
node_modules/.bin/qape -u https://www.example.com
```

If/When he finds an error, you can display reproducible errors like this
```
node_modules/.bin/qape report/*minified.json -p -u https://www.example.com
```

Display available options like this
```
node_modules/.bin/qape --help
```

### Configuration
QApe will look for configuraition file in your current directory with name `qape.conf.js`.

```javascript
module.exports = {
	// Number of parallel chrome instances initialized'
	parallelInstances: 1,
	// Time in ms, after which no more scenarios will be initialized, set to 0 to run forever
	stopNewScenariosAfterTime: 100000,
	// Maximal number of actions performed in a random scenario
	// (if error occures, the scenario is ended)
	actionsPerScenario: 100,
	// Wait time after each action,
	// there should be some delay so the javascript
	// at your website is executed and an error
	// is displayed before performing another action.
	afterActionWaitTime: 500,
	// Number of execution errors of actions to abort the random scenario.
	// This prevents from infinity loops, when qape is not able to perform
	// any action on the page and keeps retrying.
	numberOfActionFailuresToAbortRandomScenario: 20,
	// Starting url for all random scenarios
	url: 'http://localhost:4444',
	// After an error occured, qape will try to reproduce the error again
	// and will retry up to this number of actions before giving up.
	numberOfAllowedActionsToReproduceErrorFromPreviousRun: 20,
	// Disables random scenarios,
	// only user defined scenarios will be executed
	randomScenariosDisabled: false,
	// When user defined scenario recieves an error,
	// it will try to minify the steps to reproduce this error.
	minifyUserDefinedScenarios: true,
	// Disables chromium headless mode and will display browser GUI.
	headlessModeDisabled: false,
	// Preview mode will overwrite other config values
	// to display the scenario on the local computer
	// in non-headless mode. It will also run only
	// user defined scenarios and will not try to minify them.
	previewMode: false,
	// Wait time (in ms) between actions in preview mode.
	previewModePauseTime: 1500,
	// Default browser settings passed to puppeteer.launch()
	defaultBrowserSettings: {
		ignoreHTTPSErrors: true,
		defaultViewport: {
			width: 1280,
			height: 720
		},
		args: [
			'--start-maximized',
			'--user-agent=Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
		]
	},
	// Default navigation timeout set via page.setDefaultNavigationTimeout()
	defaultNavigationTimeout: 60000,
	// Page error handler, which should tell what is actually an error.
	// Function is evaluated in the browser context via
	// page.evaluateOnNewDocument() and has method
	// "qapeError(error)" available.
	pageErrorHandler: () => {
		window.addEventListener('error', (event) => {
			qapeError(event.error.toString());
		});
	},
	// A browser websocket endpoint to connect to (i.e. ws://5.5.5.5:3505)
	browserWebSocketEndpoint: null,
	// Define your reporters for the QApe run.
	// You can pass a string for reporters in npm registry,
	// i.e. if you pass \'super\', QApe will look for
	// reporter 'qape-reporter-super'. You can also pass Class.
	reporters: ['default'],
	// Relative path for the report output
	reportPath: './report',
}
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
