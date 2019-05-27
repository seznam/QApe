#!/usr/bin/env node

const program = require('commander');
const run = require('../lib/index.js').default;
const version = require('../package.json').version;

program
	.version(version)
	.usage('[options] [files ...]')
	.option('-u, --url <url>', 'target web url')
	.option('-h, --headless-mode-disabled', 'run browser in headfull mode')
	.option('-i, --parallel-instances <number>', 'parallel browser instances', parseInt)
	.option('-p, --preview-mode', 'run in preview mode')
	.option('-r, --random-scenarios-disabled', 'disables random scenarios')
	.option('-s, --browser-webs-socket-endpoint <value>', 'connect to remote chrome instance (i.e. "ws://5.5.5.5:3505")')
	.option('-a, --stop-new-scenarios-after-time <number>', 'stops new scenarios after specified amount of time (in ms), set to 0 to disable', parseInt)
	.option('-d, --debug', 'run in debug mode')
	.action((...args) => {
		let cliConfig = {
			url,
			headlessModeDisabled,
			parallelInstance,
			previewMode,
			randomScenariosDisabled,
			browserWebSocketEndpoint,
			stopNewScenariosAfterTime,
			debug
		} = args.pop();

		if (args.length > 0) {
			cliConfig.files = args;
		}

		run(cliConfig);
	}).parse(process.argv);
