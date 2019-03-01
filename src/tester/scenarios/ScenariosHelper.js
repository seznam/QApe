/**
 * Scenarios helpers
 */
export default class ScenariosHelper {
	/**
	 * @param {Object} config
	 * @param {ActionsHandler} actionsHandler
	 */
	constructor(config, actionsHandler) {
		this._config = config;

		this._actionsHandler = actionsHandler;
	}

	/**
	 * Executes specified scenario
	 * @param {Browser} instance
	 * @param {Object[]} scenario
	 * @returns {Promise<Object>} Execution results
	 */
	async runScenario(instance, scenario) {
		let errors = [];
		let executedScenario = [];
		let executionError;

		try {
			const response = await instance.page.goto(scenario[0].beforeLocation);

			if (response.status() >= 400) {
				throw Error(`Recieved wrong status code ${response.status()}`);
			}
		} catch (e) {
			return {
				scenario: executedScenario,
				errors,
				executionError: `ScenariosHelper: Unable to navigate to location ${scenario && scenario[0] && scenario[0].beforeLocation}\n${e.stack}`
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
