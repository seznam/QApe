module.exports = {
	parallelInstances: {
		value: 1,
		description: 'Number of parallel chrome instances initialized',
		type: 'number'
	},
	stopNewScenariosAfterTime: {
		value: 10000,
		description: 'Time in ms, after which no more scenarios will be initialized, set to 0 to run forever',
		type: 'number'
	},
	actionsPerScenario: {
		value: 100,
		description: 'Maximal number of actions performed in a random scenario (if error occures, the scenario is ended)',
		type: 'number'
	},
	afterActionWaitTime: {
		value: 500,
		description: 'Wait time after each action, there should be some delay so the javascript at your website is executed and an error is displayed before performing another action. ',
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
		type: 'string'
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
		type: 'boolean'
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
			args: [
				'--start-maximized',
				'--user-agent=Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'
			]
		},
		description: 'Default browser settings passed to puppeteer.launch()',
		type: 'Object'
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
		type: 'Function'
	},
	beforeScenarioScript: {
		value: ({ browser, page }) => {},
		description: 'Script executed before each scenario',
		type: 'Function'
	},
	beforeActionScript: {
		value: ({ browser, page }, pageErrorHandler) => {},
		description: 'Script executed before each action',
		type: 'Function'
	},
	afterActionScript: {
		value: ({ browser, page }, pageErrorHandler) => {},
		description: 'Script executed after each action',
		type: 'Function'
	},
	afterScenarioScript: {
		value: ({ browser, page }) => {},
		description: 'Script executed after each scenario',
		type: 'Function'
	},
	getElementSelector: {
		value: input => {
			function getPathTo(element) {
				if (element === document.body) {
					return '//' + element.tagName.toLowerCase();
				}

				if (!element.parentNode) {
					return '';
				}

				var siblings = element.parentNode.childNodes;
				var index = 0;

				for (var i= 0; i < siblings.length; i++) {
					var sibling = siblings[i];

					if (sibling === element) {
						return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (index + 1) + ']';
					}

					if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
						index++;
					}
				}
			}

			return getPathTo(input);
		},
		description: 'Script executed in browser context, which should generate unique element selector',
		type: 'Function'
	},
	browserWebSocketEndpoint: {
		value: null,
		description: 'A browser websocket endpoint to connect to (i.e. ws://5.5.5.5:3505)',
		type: 'string'
	},
	reporters: {
		value: ['console', 'file', 'spinner'],
		description: 'Define your reporters for the QApe run. You can pass a string for reporters in npm registry, i.e. if you pass \'super\', QApe will look for reporter \'qape-reporter-super\'. You can also pass Class.',
		type: 'string[]|Class[]'
	},
	reportPath: {
		value: './report',
		description: 'Relative path for the report output',
		type: 'string'
	},
	files: {
		value: [],
		description: 'File paths to regression tests generated by QApe file reporter',
		type: 'string[]'
	},
	testerTimeout: {
		value: 300000,
		description: 'If a tester did not send any message for this period of time, it will be killed and replaced with a new one.',
		type: 'number'
	}
}
