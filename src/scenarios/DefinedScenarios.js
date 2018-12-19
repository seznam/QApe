import AbstractScenarios from './AbstractScenarios';

/**
 * Defined scenarios are saved scenarios from previous runs,
 * or manually created. They are executed with higher priority,
 * than random scenarios.
 * @extends {AbstractScenarios}
 */
export default class DefinedScenarios extends AbstractScenarios {
	/**
	 * Specifies scenario type name
	 * @returns {string} 'defined'
	 */
	get type() {
		return 'defined';
	}

	/**
	 * Generates a method,
	 * which will execute the defined scenario
	 * @returns {Function} Scenario method takes
	 * browser instance as an argument.
	 */
	getScenario() {
		let { scenario, name } = this._scenarios.shift();

		return async (instance) => {
			this._reporter.emit('scenario:start', {
				type: this.type,
				instance,
				name,
				scenario
			});

			let results = await this._scenariosHelper.runScenario(instance, scenario);

			this._reporter.emit('scenario:end', {
				type: this.type,
				instance,
				name,
				scenario,
				results
			});

			if (this._config.minifyUserDefinedScenarios && results.errors.length > 0) {
				return results;
			}
		}
	}
}
