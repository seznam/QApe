import AbstractScenarios from './AbstractScenarios';

/**
 * FailingScenarios is initialized, when page error occured.
 * It tries to reproduce the error and tell you the exact steps,
 * how to do that.
 * @extends {AbstractScenarios}
 */
export default class FailingScenarios extends AbstractScenarios {
	/**
	 * Specifies scenario type name
	 * @returns {string} 'failing'
	 */
	get type() {
		return 'failing';
	}

	/**
	 * Generates a method,
	 * which will execute the failing scenario
	 * @returns {Function} Scenario method takes
	 * browser instance as an argument and
	 * it will try to reproduce the scenario error.
	 */
	getScenario() {
		let { scenario, errors } = this._scenarios.shift();

		return async (instance) => {
			let lastSteps = [];
			let results;
			let retryActions = this._getNumberOfRetryActions(scenario.length);

			this._reporter.emit('scenario:start', {
				type: this.type,
				instance,
				scenario,
				errors
			});

			for (let i = 0; i < retryActions; i++) {
				lastSteps = scenario.slice(
					scenario.length - lastSteps.length - 1
				);

				results = await this._scenariosHelper.runScenario(instance, lastSteps);

				if (results.errors.length > 0) {
					break;
				}
			}

			if (results && results.errors && results.errors.length > 0) {
				let minifiedScenario = await this._reduceScenarioSteps(instance, lastSteps);

				this._reporter.emit('scenario:end', {
					type: this.type,
					instance,
					minified: true,
					scenario: minifiedScenario,
					errors: results.errors
				});
			} else {
				this._reporter.emit('scenario:end', {
					type: this.type,
					instance,
					minified: false,
					scenario,
					errors
				});
			}
		}
	}

	/**
	 * @param {number} scenarioLength
	 * @returns {number} Allowed number of actions from history
	 * to reproduce the error based on scenario length and config.
	 */
	_getNumberOfRetryActions(scenarioLength) {
		if (this._config.numberOfAllowedActionsToReproduceErrorFromPreviousRun > scenarioLength) {
			return scenarioLength;
		}

		return this._config.numberOfAllowedActionsToReproduceErrorFromPreviousRun;
	}

	/**
	 * Removes scenario actions,
	 * that are not necessary to reproduce the error
	 * @param {Browser} instance
	 * @param {Object[]} scenario
	 * @returns {Object} Minified scenario reproducing the error
	 */
	async _reduceScenarioSteps(instance, scenario) {
		let minifiedScenario = scenario;

		for (let i = 1; i < minifiedScenario.length; i++) {
			let tmpScenario = minifiedScenario.filter((_, index) => index !== i);

			let results = await this._scenariosHelper.runScenario(instance, tmpScenario);

			if (results.errors.length > 0) {
				minifiedScenario = tmpScenario;
				i--;
			}
		};

		return minifiedScenario;
	}
}
