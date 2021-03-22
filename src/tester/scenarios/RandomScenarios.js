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
     * @param {Browser} instance
     * @param {Object} scenario
     * @returns {Promise<Object>} results
     */
    async runScenario(instance, scenario) {
        let results = {};

        report('scenario:start', {
            type: this.type,
            scenario,
        });

        let response = await instance.page.goto(scenario.startUrl);

        if (response.status() >= 400) {
            results.executionError = `Cannot load url ${scenario.startUrl} [status: ${response.status()}]`;
        } else {
            results = await this._performActions(instance);
        }

        report('scenario:end', {
            type: this.type,
            scenario,
            results,
        });

        return results;
    }

    /**
     * Performs random actions on the instance
     * @param {Browser} instance
     * @returns {Promise<Object>} results
     */
    async _performActions(instance) {
        let results = { scenario: [], errors: [] };
        let failedActionsCount = 0;

        await this._config.beforeScenarioScript(instance);

        for (let i = 0; i < this._config.actionsPerScenario; i++) {
            let actionResults = await this._actionsHandler.execute(instance);

            if (actionResults.executionError) {
                failedActionsCount++;

                if (failedActionsCount >= this._config.numberOfActionFailuresToAbortRandomScenario) {
                    results.executionError =
                        'Reached limit of allowed action execution errors.\n' + actionResults.executionError;
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

        await this._config.afterScenarioScript(instance);

        return results;
    }
}
