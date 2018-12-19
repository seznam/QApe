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
	 * Generates a method,
	 * which will execute a random scenario
	 * performing actions on random page elements
	 * @returns {Function} Scenario method takes
	 * browser instance as an argument and
	 * it will try to produce some page errors.
	 */
	getScenario() {
		return async (instance) => {
			let results = { scenario: [], errors: [] };
			let failedActionsCount = 0;

			this._reporter.emit('scenario:start', {
				type: this.type,
				instance
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

			this._reporter.emit('scenario:end', {
				type: this.type,
				instance,
				results
			});

			return results;
		}
	}
}
