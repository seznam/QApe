import AbstractScenariosHandler from './AbstractScenariosHandler.js';

export default class UserDefinedScenariosHandler extends AbstractScenariosHandler {
	getScenario() {
		let { scenario, name } = this._scenarios.shift();

		return async (instance, bar) => {
			bar.reset(scenario.length);
			let results = await this._scenariosHelper.runScenario(instance, scenario, bar, 'UserDefinedScenario');

			if (results.executionError) {
				return this._reporter.log(scenario, [results.executionError.toString()], name);
			}

			if (this._config.minifyUserDefinedScenariosDisabled && results.errors.length > 0) {
				return this._reporter.log(results.scenario, results.errors, name);
			} else {
				return results;
			}
		}
	}
}
