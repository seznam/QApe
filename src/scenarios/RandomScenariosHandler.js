export default class RandomScenariosHandler {
	constructor(config, actionsHandler) {
		this._config = config;

		this._actionsHandler = actionsHandler;
	}

	getScenario() {
		return async (instance, bar) => {
			let log = { scenario: [], errors: [] };
			let failedActionsCount = 0;

			bar.reset(this._config.actionsPerScenario);

			try {
				await instance.page.goto(this._config.url);
			} catch (error) {
				log.executionError = error;

				return log;
			}

			for (let i = 0; i < this._config.actionsPerScenario; i++) {
				let results = await this._actionsHandler.execute(null, null, instance);

				if (results.executionError) {
					if (!!this._config.numberOfActionFailuresToAbortRandomScenario && failedActionsCount > this._config.numberOfActionFailuresToAbortRandomScenario) {
						log.executionError = 'Reached limit of allowed action execution errors.\n' + results.executionError;
						break;
					}

					failedActionsCount++;
					i--;
					bar.tick(0, { info: `RandomScenario (failed: ${failedActionsCount})` });
					continue;
				} else {
					failedActionsCount = 0;
				}

				bar.tick({ info: 'RandomScenario' });

				log.scenario.push(results);

				if (results && results.errors && results.errors.length > 0) {
					results.errors.forEach(error => log.errors.push(error));
					break;
				}
			}

			return log;
		}
	}
}
