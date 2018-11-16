import AbstractScenariosHandler from './AbstractScenariosHandler.js';

export default class UserDefinedScenariosHandler extends AbstractScenariosHandler {
	get type() {
		return 'defined';
	}

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

			if (results.executionError) {
				throw results.executionError;
			}

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
