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
	.option('-s, --browser-webs-socket-endpoint <value>', 'connect to remote chrome instance (i.e. "ws://5.5.5.5:3505")')
	.action((...args) => {
		let cliConfig = {
			url,
			headlessModeDisabled,
			parallelInstance,
			previewMode,
			browserWebSocketEndpoint
		} = args.pop();

		if (args.length > 0) {
			cliConfig.files = args;
		}

		run(cliConfig);
	}).parse(process.argv);
