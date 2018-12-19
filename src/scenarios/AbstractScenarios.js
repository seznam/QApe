/**
 * Abstract class for specific types of scenarios
 */
export default class AbstractScenarios {
	/**
	 * @param {Object} config
	 * @param {ScenariosHelper} scenariosHelper
	 * @param {Reporter} reporter
	 */
	constructor(config, scenariosHelper, reporter) {
		this._config = config;

		this._scenariosHelper = scenariosHelper;

		this._reporter = reporter;

		this._scenarios = [];
	}

	/**
	 * Adds scenario to the list of available scenario
	 * @param {Object} scenario
	 */
	addScenario(scenario) {
		this._scenarios.push(scenario);
	}

	/**
	 * @returns {Boolean} True if there are scenarios available
	 */
	hasScenario() {
		return this._scenarios.length > 0;
	}
}
