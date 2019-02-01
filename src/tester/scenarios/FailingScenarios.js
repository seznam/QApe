import { report } from '../messanger';

/**
 * FailingScenarios is initialized, when page error occured.
 * It tries to reproduce the error and tell you the exact steps,
 * how to do that.
 */
export default class FailingScenarios {
	/**
	 * @param {Object} config
	 * @param {ScenariosHelper} scenariosHelper
	 */
	constructor(config, scenariosHelper) {
		this._config = config;

		this._scenariosHelper = scenariosHelper;
	}

	/**
	 * Specifies scenario type name
	 * @returns {string} 'failing'
	 */
	get type() {
		return 'failing';
	}

	/**
	 * Runs a scenario, which tries to reproduce
	 * an error from the random/defined scenario
	 * with minimal number of steps.
	 * @param {Browser} instance
	 * @param {Object} testData
	 * @returns {Promise}
	 */
	async runScenario(instance, testData) {
		let { scenario, errors } = testData;
		let lastSteps = [];
		let results;
		let retryActions = this._getNumberOfRetryActions(scenario.length);

		report('scenario:start', {
			type: this.type,
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

			report('scenario:end', {
				type: this.type,
				minified: true,
				scenario: minifiedScenario,
				errors: results.errors
			});
		} else {
			report('scenario:end', {
				type: this.type,
				minified: false,
				scenario,
				errors
			});
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
