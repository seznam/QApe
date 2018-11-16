module.exports = {
	// Number of parallel chrome instances initialized'
	parallelInstances: 1,
	// Time in ms, after which no more scenarios will be initialized
	stopNewScenariosAfterTime: 100000,
	// Maximal number of actions performed in a random scenario
	// (if error occures, the scenario is ended)
	actionsPerScenario: 100,
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
		args: ['--start-maximized']
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
