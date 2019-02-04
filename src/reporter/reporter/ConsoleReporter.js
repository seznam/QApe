import EventEmitter from 'events';

/**
 * Console reporter
 * @extends EventEmitter
 */
export default class ConsoleReporter extends EventEmitter {
	/**
	 * @param {Object} config
	 */
	constructor(config) {
		super();

		this._config = config;

		this.on('scenario:start', eventData => this._handleScenarioStart(eventData));
		this.on('scenario:end', eventData => this._handleScenarioEnd(eventData));
		this.on('runner:error', eventData => this._handleRunnerError(eventData));
	}

	/**
	 * Handler for scenario:start event
	 * @param {Object} eventData
	 */
	_handleScenarioStart(eventData) {
		console.log('Starting', eventData.type, 'scenario...');
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
		console.error(eventData.error);
	}

	/**
	 * Handler for scenario:end of type 'defined'
	 * @param {Object} eventData
	 */
	_handleDefinedScenarioEnd({ name, results }) {
		let { scenario, errors, executionError } = results;
		let statusSymbol = '✓';

		if (errors.length > 0) {
			statusSymbol = '✘';
		}

		if (executionError) {
			return this._logConsole(`# ${name} [ExecutionError]`, [], [executionError]);
		}

		this._logConsole(`${statusSymbol} ${name}`, scenario, errors);
	}

	/**
	 * Handler for scenario:end of type 'failing'
	 * @param {Object} eventData
	 */
	_handleFailingScenarioEnd({ minified, scenario, errors }) {
		if (minified) {
			this._logConsole(
				'+ New scenario causing an error identified',
				scenario,
				errors
			);
		} else {
			this._logConsole(
				'+ Recieved following error, but failed to reproduce it',
				[],
				errors
			);
		}
	}

	/**
	 * Handler for scenario:end of type 'random'
	 * @param {Object} eventData
	 */
	_handleRandomScenarioEnd({ results }) {
		if (results.executionError) {
			console.log('Random scenario recieved execution error.');
			console.log(results.executionError);
		} else if (results.errors.length > 0) {
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
}
