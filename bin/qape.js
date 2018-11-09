#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var path = require('path');
var Runner = require('../lib/Runner.js').default;
var defaultConfigValues = require('../lib/config/template.js');
var version = require('../package.json').version;
var configValues = {};

const USER_CONFIG_PATH = path.join(process.cwd(), './qape.conf.js');

function getOptionSyntax(option, type) {
	let long = '--' + option.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
	let short = '-' + option.charAt(0);

	if (type === 'boolean') {
		return `${short}, ${long}`;
	}

	return `${short}, ${long} <${type}>`;
}

function getTypeHandler(type) {
	switch (type) {
		case 'number': return val => parseInt(val);
		case 'string[]': return val => val.split(',');
		default: return val => val;
	}
}

program
	.version(version)
	.usage('[options] [scenarioFiles ...]');

Object
	.keys(defaultConfigValues)
	.forEach(key => {
		let { description, type, value, syntax, cli_disabled } = defaultConfigValues[key];

		if (cli_disabled) {
			return;
		}

		program.option(syntax || getOptionSyntax(key, type), description, getTypeHandler(type));
	});

program.parse(process.argv);

if (fs.existsSync(USER_CONFIG_PATH)) {
	configValues = require(USER_CONFIG_PATH);
}

Object
	.keys(defaultConfigValues)
	.forEach(key => {
		if (program[key]) {
			configValues[key] = program[key]
		}
	});

new Runner(configValues)
	.start(program.args)
	.catch(() => process.exit(1));
