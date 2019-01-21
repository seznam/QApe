#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const path = require('path');
const Runner = require('../lib/Runner.js').default;
const version = require('../package.json').version;
const USER_CONFIG_PATH = path.join(process.cwd(), './qape.conf.js');

let configValues = {};

if (fs.existsSync(USER_CONFIG_PATH)) {
	configValues = require(USER_CONFIG_PATH);
}

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

		cliConfig.files = args;

		return new Runner(Object.assign({}, configValues, cliConfig))
			.start()
			.catch(error => {
				if (error) {
					console.error(error);
				}

				process.exit(1);
			});
	}).parse(process.argv);
