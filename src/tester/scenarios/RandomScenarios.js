import { report } from '../messanger';

/**
 * Random scenarios are default types of scenarios
 * executed whenever there is nothing else to execute.
 * They randomly click on the website and search for errors.
 */
export default class RandomScenarios {
	/**
	 * @param {Object} config
	 * @param {ActionsHandler} actionsHandler
	 * @param {Reporter} reporter
	 */
	constructor(config, actionsHandler, reporter) {
		this._config = config;

		this._actionsHandler = actionsHandler;

		this._reporter = reporter;
	}

	/**
	 * Specifies scenario type name
	 * @returns {string} 'random'
	 */
	get type() {
		return 'random';
	}

	/**
	 * Executes a random scenario
	 * performing actions on random page elements
	 * and trying to produce some page errors.
	 * @params {Browser} instance
	 * @returns {Promise}
	 */
	async runScenario(instance) {
		let results = { scenario: [], errors: [] };
		let failedActionsCount = 0;

		report('scenario:start', {
			type: this.type
		});

		await instance.page.goto(this._config.url);

		for (let i = 0; i < this._config.actionsPerScenario; i++) {
			let actionResults = await this._actionsHandler.execute(null, null, instance);

			if (actionResults.executionError) {
				failedActionsCount++;

				if (failedActionsCount >= this._config.numberOfActionFailuresToAbortRandomScenario) {
					results.executionError = new Error('Reached limit of allowed action execution errors.\n' + actionResults.executionError);
					break;
				}

				i--;
				continue;
			} else {
				failedActionsCount = 0;
			}

			results.scenario.push(actionResults);

			if (actionResults && actionResults.errors && actionResults.errors.length > 0) {
				results.errors = actionResults.errors;
				break;
			}
		}

		report('scenario:end', {
			type: this.type,
			results
		});

		return results;
	}
}
