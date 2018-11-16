import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import isEqual from 'lodash.isequal';
import { formatDigits } from '../helpers';

/**
 * Default reporter
 * @extends EventEmitter
 */
export default class DefaultReporter extends EventEmitter {
	/**
	 * @param {Object} config
	 */
	constructor(config) {
		super();

		this._config = config;

		this._results = [];

		this.on('scenario:end', eventData => this._handleScenarioEnd(eventData));
		this.on('runner:error', eventData => this._handleRunnerError(eventData));
	}

	/**
	 * Handler for scenario:end event
	 * @param {Object} eventData
	 */
	_handleScenarioEnd(eventData) {
		switch (eventData.type) {
			case 'defined': return this._handleDefinedScenarioEnd(eventData);
			case 'failing': return this._handleFailingScenarioEnd(eventData);
			case 'random': return this._handleRandomScenarioEnd(eventData);
		}
	}

	/**
	 * Handler for runner:error event
	 * @param {Object} eventData
	 */
	_handleRunnerError(eventData) {
		console.error(eventData.error.toString());
	}

	/**
	 * Handler for scenario:end of type 'defined'
	 * @param {Object} eventData
	 */
	_handleDefinedScenarioEnd({ name, results }) {
		let { scenario, errors } = results;
		let statusSymbol = '✓';

		if (errors.length > 0) {
			statusSymbol = '✘';
			this._results.push(results);

			this._logFile(scenario, errors, name);
		}

		this._logConsole(`${statusSymbol} ${name}`, scenario, errors);
	}

	/**
	 * Handler for scenario:end of type 'failing'
	 * @param {Object} eventData
	 */
	_handleFailingScenarioEnd({ minified, scenario, errors }) {
		if (this._isFailureReported(scenario)) {
			return;
		}

		this._results.push({ scenario, errors });

		let filePath = this._logFile(
			scenario,
			errors,
			this._getScenarioName(minified ? '-minified' : '-not-reproduced')
		);
		let message = minified ?
			`+ New scenario causing an error identified (${filePath})`
		:
			`+ Recieved following error, but failed to reproduce it (${filePath})`;
		this._logConsole(message, scenario, errors);
	}

	/**
	 * Handler for scenario:end of type 'random'
	 * @param {Object} eventData
	 */
	_handleRandomScenarioEnd({ results }) {
		if (results.errors.length > 0) {
			console.log('Random scenario recieved following error.');

			results.errors.forEach(error => console.log(error));
		} else {
			console.log('Random scenario did not find any errors.');
		}
	}

	/**
	 * Logs scenario to console
	 * @param {string} text
	 * @param {Object[]} scenario
	 * @param {Object[]} errors
	 */
	_logConsole(text, scenario, errors) {
		console.log(text);
		if (scenario.length > 0) {
			console.log('StartLocation:', scenario[0].beforeLocation);
			scenario.forEach(action => console.log(action.message));
		}
		errors.forEach(error => console.log(error));
	}

	/**
	 * Logs scenario to file
	 * @param {Object[]} scenario
	 * @param {Object[]} errors
	 * @param {string} name
	 */
	_logFile(scenario, errors, name) {
		if (!name) {
			name = this._getScenarioName();
		}

		if (!fs.existsSync(this._config.reportPath)) {
			fs.mkdirSync(this._config.reportPath);
		}

		let filePath = path.join(this._config.reportPath, name + '.json');

		if (fs.existsSync(filePath)) {
			let i = 0;

			do {
				i++;
				filePath = path.join(this._config.reportPath, name + ` (${i}).json`);
			} while (fs.existsSync(filePath))
		}

		fs.writeFileSync(filePath, JSON.stringify({ name, errors, scenario }, null, '\t'));

		return filePath;
	}

	/**
	 * Generates scenario name from current date
	 * @param {string} [extension=] This string
	 * will be added to the end of the name
	 * @returns {string}
	 */
	_getScenarioName(extension = '') {
		let date = new Date();

		return [
			date.getFullYear(),
			formatDigits(date.getMonth() + 1),
			formatDigits(date.getDate()),
			formatDigits(date.getHours()),
			formatDigits(date.getMinutes()),
			formatDigits(date.getSeconds()),
			formatDigits(date.getMilliseconds(), 3)
		].join('-') + extension;
	}

	/**
	 * Checks if provided scenario is already reported
	 * @returns {boolean}
	 */
	_isFailureReported(scenario) {
		return !!this._results.find(result => isEqual(result.scenario, scenario));
	}
}
