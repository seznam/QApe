import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { formatDigits } from '../helpers';

export default class Reporter {
	constructor(config, actionsHandler) {
		this._config = config;

		this._actionsHandler = actionsHandler;

		this._results = [];
	}

	log(scenario, errors, name) {
		let statusSymbol = '✓';

		if (errors.length > 0) {
			statusSymbol = '✘';
			this._results.push({ scenario, errors });

			this._logFile(scenario, errors, name);
		}

		this._logConsole(`${statusSymbol} ${name}`, scenario, errors);
	}

	logScenario(scenario, errors) {
		if (this._isFailureReported(scenario)) {
			return;
		}

		this._results.push({ scenario, errors });

		let filePath = this._logFile(scenario, errors, this._getScenarioName() + '-minified');
		this._logConsole(`! New scenario causing an error identified (${filePath})`, scenario, errors);
	}

	logFailure(scenario, errors) {
		this._results.push({ scenario, errors });

		let filePath = this._logFile(scenario, errors, this._getScenarioName() + '-not-reproduced');
		this._logConsole(`! Recieved following error, but failed to reproduce it (${filePath})`, scenario, errors);
	}

	isSuccess() {
		return this._results.length === 0;
	}

	_logConsole(text, scenario, errors) {
		console.log(text);
		errors.forEach(error => console.log(error));
		if (scenario.length > 0) {
			this._logAction(scenario[scenario.length - 1]);
		}
	}

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

	_getScenarioName() {
		let date = new Date();

		return [
			date.getFullYear(),
			formatDigits(date.getMonth() + 1),
			formatDigits(date.getDate()),
			formatDigits(date.getHours()),
			formatDigits(date.getMinutes()),
			formatDigits(date.getSeconds()),
			formatDigits(date.getMilliseconds(), 3)
		].join('-');
	}

	_logActions(scenario) {
		scenario.forEach(step => {
			this._logAction(step);
		});
	}

	_logAction(step) {
		let action = this._actionsHandler.getAction(step.action);

		action.actionConfig = step.config;

		console.log('Location:', step.beforeLocation);
		action.log();
	}

	_isFailureReported(scenario) {
		return !!this._results.find(result => _.isEqual(result.scenario, scenario));
	}
}
