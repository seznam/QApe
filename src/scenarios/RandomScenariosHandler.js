export default class RandomScenariosHandler {
	constructor(config, actionsHandler, reporter) {
		this._config = config;

		this._actionsHandler = actionsHandler;

		this._reporter = reporter;
	}

	get type() {
		return 'random';
	}

	getScenario() {
		return async (instance) => {
			let log = { scenario: [], errors: [] };
			let failedActionsCount = 0;

			this._reporter.emit('scenario:start', {
				type: this.type,
				instance
			});

			await instance.page.goto(this._config.url);

			for (let i = 0; i < this._config.actionsPerScenario; i++) {
				let results = await this._actionsHandler.execute(null, null, instance);

				if (results.executionError) {
					if (failedActionsCount > this._config.numberOfActionFailuresToAbortRandomScenario) {
						throw Error('Reached limit of allowed action execution errors.\n' + results.executionError);
					}

					failedActionsCount++;
					i--;
					continue;
				} else {
					failedActionsCount = 0;
				}

				log.scenario.push(results);

				if (results && results.errors && results.errors.length > 0) {
					results.errors.forEach(error => log.errors.push(error));
					break;
				}
			}

			this._reporter.emit('scenario:end', {
				type: this.type,
				instance,
				results: log
			});

			return log;
		}
	}
}
