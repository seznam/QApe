module.exports = {
	parallelInstances: {
		value: 1,
		description: 'Number of parallel chrome instances initialized',
		type: 'number',
		syntax: '-i, --parallel-instances <number>'
	},
	stopNewScenariosAfterTime: {
		value: 100000,
		description: 'Time in ms, after which no more scenarios will be initialized, set to 0 to run forever',
		type: 'number'
	},
	actionsPerScenario: {
		value: 100,
		description: 'Maximal number of actions performed in a random scenario (if error occures, the scenario is ended)',
		type: 'number'
	},
	numberOfActionFailuresToAbortRandomScenario: {
		value: 20,
		description: 'Number of execution errors of actions to abort the random scenario. This prevents from infinity loops, when qape is not able to perform any action on the page and keeps retrying.',
		type: 'number'
	},
	url: {
		value: 'http://localhost:4444',
		description: 'Starting url for all random scenarios',
		type: 'string',
		syntax: '-u, --url <string>'
	},
	numberOfAllowedActionsToReproduceErrorFromPreviousRun: {
		value: 20,
		description: 'After an error occured, qape will try to reproduce the error again and will retry up to this number of actions before giving up.',
		type: 'number'
	},
	randomScenariosDisabled: {
		value: false,
		description: 'Disables random scenarios, only user defined scenarios will be executed',
		type: 'boolean'
	},
	minifyUserDefinedScenarios: {
		value: true,
		description: 'When user defined scenario recieves an error, it will try to minify the steps to reproduce this error.',
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
		type: 'number'
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
		type: 'number'
	},
	pageErrorHandler: {
		value: () => {
			window.addEventListener('error', (event) => {
				qapeError(event.error.toString());
			});
		},
		description: 'Page error handler, which should tell what is actually an error. Function is evaluated in the browser context via page.evaluateOnNewDocument() and has method "qapeError(error)" available.',
		type: 'Function',
		cli_disabled: true
	},
	browserWebSocketEndpoint: {
		value: null,
		description: 'A browser websocket endpoint to connect to (i.e. ws://5.5.5.5:3505)',
		type: 'string'
	},
	reporters: {
		value: ['default'],
		description: 'Define your reporters for the QApe run. You can pass a string for reporters in npm registry, i.e. if you pass \'super\', QApe will look for reporter \'qape-reporter-super\'. You can also pass Class.',
		type: 'string[]|Class[]'
	},
	reportPath: {
		value: './report',
		description: 'Relative path for the report output',
		type: 'string'
	}
}
