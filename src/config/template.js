module.exports = {
	parallelInstances: {
		value: 1,
		description: 'Number of parallel chrome instances initialized',
		type: 'number',
		syntax: '-i, --parallel-instances <number>'
	},
	stopNewScenariosAfterTime: {
		value: 100000,
		description: 'Time in ms, after which no more scenarios will be initialized',
		type: 'number'
	},
	actionsPerScenario: {
		value: 100,
		description: 'Maximal number of actions performed in a random scenario (if error occures, the scenario is ended)',
		type: 'number'
	},
	numberOfActionFailuresToAbortRandomScenario: {
		value: 20,
		description: 'Number of execution errors of actions to abort the random scenario. This prevents from infinity loops, when opicak is not able to perform any action on the page and keeps retrying.',
		type: 'number'
	},
	url: {
		value: 'http://localhost:4444',
		description: 'Starting url for all random scenarios',
		type: 'string'
	},
	numberOfAllowedActionsToReproduceErrorFromPreviousRun: {
		value: 20,
		description: 'After an error occured, opicak will try to reproduce the error again and will retry up to this number of actions before giving up.',
		type: 'number'
	},
	randomScenariosDisabled: {
		value: false,
		description: 'Disables random scenarios, only user defined scenarios will be executed',
		type: 'boolean',
		syntax: '-d, --random-scenarios-disabled'
	},
	minifyUserDefinedScenariosDisabled: {
		value: false,
		description: 'When user defined scenario recieves an error, it will no longer try to minify the steps to reproduce this error.',
		type: 'boolean'
	},
	headlessModeDisabled: {
		value: false,
		description: 'Disables chromium headless mode and will display browser GUI.',
		type: 'boolean'
	},
	previewMode: {
		value: false,
		description: 'Preview mode will overwrite other config values to display the scenario on the local computer in non-headless mode. It will also run only user defined scenarios and will not try to minify them.',
		type: 'boolean',
		syntax: '-p, --preview-mode'
	},
	previewModePauseTime: {
		value: 1500,
		description: 'Wait time (in ms) between actions in preview mode.',
		type: 'number',
		syntax: '-t, --preview-mode-pause-time <number>'
	},
	defaultBrowserSettings: {
		value: {
			ignoreHTTPSErrors: true,
			defaultViewport: {
				width: 1280,
				height: 720
			},
			args: ['--start-maximized']
		},
		description: 'Default browser settings passed to puppeteer.launch()',
		type: 'Object',
		cli_disabled: true
	},
	defaultNavigationTimeout: {
		value: 60000,
		description: 'Default navigation timeout set via page.setDefaultNavigationTimeout()',
		type: 'number',
		syntax: '-t, --default-navigation-timeout <number>'
	},
	pageErrorHandler: {
		value: () => {
			window.addEventListener('error', (event) => {
				opicakError(event.error.toString());
			});
		},
		description: 'Page error handler, which should tell what is actually an error. Function is evaluated in the browser context via page.evaluateOnNewDocument() and has method "opicakError(error)" available.',
		type: 'Function',
		cli_disabled: true
	},
	browserWebSocketEndpoint: {
		value: null,
		description: 'A browser websocket endpoint to connect to (i.e. ws://5.5.5.5:3505)',
		type: 'string',
		syntax: '-e, --browser-web-socket-endpoint <string>'
	},
	reportPath: {
		value: './report',
		description: 'Relative path for the report output',
		type: 'string'
	}
}
