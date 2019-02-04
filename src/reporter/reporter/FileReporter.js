import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import isEqual from 'lodash.isequal';
import { formatDigits } from '../../shared/helpers';

/**
 * Default reporter
 * @extends EventEmitter
 */
export default class FileReporter extends EventEmitter {
	/**
	 * @param {Object} config
	 */
	constructor(config) {
		super();

		this._config = config;

		this._results = [];

		this.on('scenario:end', eventData => this._handleScenarioEnd(eventData));
	}

	/**
	 * Handler for scenario:end event
	 * @param {Object} eventData
	 */
	_handleScenarioEnd(eventData) {
		if (eventData.type === 'failing') {
			this._handleFailingScenarioEnd(eventData);
		}
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

		this._logFile(
			scenario,
			errors,
			this._getScenarioName(minified ? '-minified' : '-not-reproduced')
		);
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
		let i = 0;

		while (fs.existsSync(filePath)) {
			i++;
			filePath = path.join(this._config.reportPath, name + ` (${i}).json`);
		}

		fs.writeFileSync(filePath, JSON.stringify({ name, errors, scenario }, null, '\t'));
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
