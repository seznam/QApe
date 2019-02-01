import { report } from '../messanger';

/**
 * Defined scenarios are saved scenarios from previous runs,
 * or manually created. They are executed with higher priority,
 * than random scenarios.
 */
export default class DefinedScenarios {
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
	 * @returns {string} 'defined'
	 */
	get type() {
		return 'defined';
	}

	/**
	 * Runs a scenario defined by the user.
	 * @param {Browser} instance
	 * @param {Object} testData
	 * @returns {Promise}
	 */
	async runScenario(instance, testData) {
		let { scenario, name } = testData;

		report('scenario:start', {
			type: this.type,
			name,
			scenario
		});

		let results = await this._scenariosHelper.runScenario(instance, scenario);

		report('scenario:end', {
			type: this.type,
			name,
			scenario,
			results
		});

		if (this._config.minifyUserDefinedScenarios && results.errors.length > 0) {
			return results;
		}
	}
}
