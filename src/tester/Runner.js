import Browser from './browser/Browser';
import ScenariosHandler from './scenarios/ScenariosHandler';
import ActionsHandler from './actions/ActionsHandler';
import { report, requestScenario, sendFailingScenario } from './messanger';
import fs from 'fs';
import path from 'path';

/**
 * QApe runner class which sets up the whole test run.
 */
export default class Runner {
	/**
	 * @param {Object} config
	 */
	constructor(config) {
		this._config = config;
		this._scenariosHandler = null;
		this._actionsHandler = null;
		this._isSuccess = true;
	}

	/**
	 * Initializes all dependencies and
	 * starts all parallel instances.
	 * @returns {Promise} Resolves for successful run,
	 * rejects for failure
	 */
	start() {
		this._init();

		return this._startInstance()
			.then(() => {
				if (this._isSuccess) {
					return Promise.resolve();
				}

				return Promise.reject();
			});
	}

	/**
	 * Starts single test instance with all dependencies
	 * @returns {Promise}
	 */
	async _startInstance() {
		while (true) {
			let { scenario, type } = await requestScenario();

			if (!scenario && !type) {
				break;
			}

			let instance = await this._getBrowserInstance();
			let results;

			report('runner:start', { scenario });

			try {
				await this._config.beforeScenarioScript(instance);
				results = await this._scenariosHandler.runScenario(instance, type, scenario);
				await this._config.afterScenarioScript(instance);
			} catch (error) {
				report('runner:error', {
					scenario,
					error
				});
			}

			if (results && results.errors && results.errors.length > 0) {
				this._isSuccess = false;
				sendFailingScenario(results);
			}

			await instance.clear();

			report('runner:end');
		}
	}

	/**
	 * Initializes browser instance
	 * @returns {Browser} instance
	 */
	_getBrowserInstance() {
		return new Browser(this._config).initBrowser();
	}

	/**
	 * Initializes all runner dependencies
	 */
	_init() {
		this._initActionsHandler();
		this._initScenariosHandler();
	}

	/**
	 * Initializes ActionsHandler instance
	 */
	_initActionsHandler() {
		this._actionsHandler = new ActionsHandler(this._config).init();
	}

	/**
	 * Initializes ScenariosHandler instance
	 */
	_initScenariosHandler() {
		this._scenariosHandler = new ScenariosHandler(this._config, this._actionsHandler).init();
	}
}
