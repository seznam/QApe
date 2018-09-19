import AbstractScenariosHandler from './AbstractScenariosHandler';
import { sumPartialSeries } from '../helpers';

export default class FailingScenariosHandler extends AbstractScenariosHandler {
	getScenario() {
		let { scenario, errors } = this._scenarios.shift();

		return async (instance, bar) => {
			let lastSteps = [];
			let results;

			this._initBar(bar, scenario.length);

			for (let i = 0; i < this._getNumberOfRetryActions(scenario.length); i++) {
				lastSteps.unshift(scenario.pop());

				results = await this._scenariosHelper.runScenario(instance, lastSteps, bar, 'FailingScenario');

				if (results.executionError) {
					continue;
				}

				if (results.errors.length > 0) {
					break;
				}
			}

			if (results && results.errors && results.errors.length > 0) {
				let minifiedScenario = await this._reduceScenarioSteps(instance, lastSteps, bar);

				this._reporter.logScenario(minifiedScenario, results.errors);
			} else {
				this._reporter.logFailure(scenario.concat(lastSteps), errors);
			}
		}
	}

	_getNumberOfRetryActions(scenarioLength) {
		if (this._config.numberOfAllowedActionsToReproduceErrorFromPreviousRun > scenarioLength) {
			return scenarioLength;
		}

		return this._config.numberOfAllowedActionsToReproduceErrorFromPreviousRun;
	}

	_initBar(bar, scenarioLength) {
		let numberOfRetryActions = this._getNumberOfRetryActions(scenarioLength);
		let maximumPossibleNumberOfActions = sumPartialSeries(numberOfRetryActions) + numberOfRetryActions * (numberOfRetryActions - 1);

		bar.reset(maximumPossibleNumberOfActions);
	}

	async _reduceScenarioSteps(instance, scenario, bar) {
		let minifiedScenario = scenario;

		for (let i = 1; i < minifiedScenario.length; i++) {
			let maxRemainingActions = bar.getCurrent() + minifiedScenario.length * (minifiedScenario.length - 1);
			let tmpScenario = minifiedScenario.filter((_, index) => index !== i);

			bar.updateLength(maxRemainingActions);

			let results = await this._scenariosHelper.runScenario(instance, tmpScenario, bar, 'FailingScenario');

			if (results.errors.length > 0) {
				minifiedScenario = tmpScenario;
				i--;
			}
		};

		return minifiedScenario;
	}
}
