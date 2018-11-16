export default class ScenariosHelper {
	constructor(config, actionsHandler) {
		this._config = config;

		this._actionsHandler = actionsHandler;
	}

	async runScenario(instance, scenario) {
		let errors = [];
		let executedScenario = [];
		let executionError;

		try {
			if (scenario && scenario[0] && scenario[0].beforeLocation) {
				await instance.page.goto(scenario[0].beforeLocation);
			} else {
				return {
					executedScenario,
					errors,
					executionError: new Error('ScenariosHelper: beforeLocation of a scenario action is not defined.')
				}
			}
		} catch (e) {
			return {
				executedScenario,
				errors,
				executionError: new Error(`ScenariosHelper: Unable to navigate to location ${scenario[0].beforeLocation}\n${e}`)
			};
		}

		for (let i = 0; i < scenario.length; i++) {
			let results = await this._actionsHandler.execute(
				scenario[i].action,
				scenario[i].config,
				instance
			);

			executedScenario.push(results);

			if (results.executionError) {
				executionError = results.executionError;
				break;
			}

			if (results && results.errors && results.errors.length > 0) {
				errors = results.errors;
				break;
			}
		}

		return { scenario: executedScenario, errors, executionError };
	}
}
