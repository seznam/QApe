import AbstractScenariosHandler from './AbstractScenariosHandler';

export default class FailingScenariosHandler extends AbstractScenariosHandler {
	get type() {
		return 'failing';
	}
	getScenario() {
		let { scenario, errors } = this._scenarios.shift();

		return async (instance) => {
			let lastSteps = [];
			let results;

			this._reporter.emit('scenario:start', {
				type: this.type,
				instance,
				scenario,
				errors
			});

			for (let i = 0; i < this._getNumberOfRetryActions(scenario.length); i++) {
				lastSteps.unshift(scenario.pop());

				results = await this._scenariosHelper.runScenario(instance, lastSteps);

				if (results.executionError) {
					continue;
				}

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
					scenario: scenario.concat(lastSteps),
					errors
				});
			}
		}
	}

	_getNumberOfRetryActions(scenarioLength) {
		if (this._config.numberOfAllowedActionsToReproduceErrorFromPreviousRun > scenarioLength) {
			return scenarioLength;
		}

		return this._config.numberOfAllowedActionsToReproduceErrorFromPreviousRun;
	}

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
