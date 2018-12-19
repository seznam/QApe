import Browser from './browser/Browser';
import ScenariosHandler from './scenarios/ScenariosHandler';
import Reporter from './reporter/Reporter';
import ActionsHandler from './actions/ActionsHandler';
import Config from './config/Config';
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
		this._reporter = null;
		this._initTime = null;
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
		this._loadDefinedScenarios();

		let instances = [];

		for (let i = 0; i < this._config.parallelInstances; i++) {
			instances.push(this._startInstance());
		}

		return Promise.all(instances).then(() => {
			if (this._isSuccess) {
				return Promise.resolve();
			}

			return Promise.reject();
		});
	}

	/**
	 * Loads all user defined scenarios specified in config
	 */
	_loadDefinedScenarios() {
		this._config.files.forEach(file => {
			let scenarioPath = path.join(process.cwd(), file);

			if (!fs.existsSync(scenarioPath)) {
				console.error(`Failed to load scenario at path "${scenarioPath}". File does not exist!`);
				return;
			}

			let scenario = this._loadScenarioFromPath(scenarioPath);

			this._scenariosHandler.addDefinedScenario(scenario);
		});
	}

	/**
	 * Loads a scenario from specified scenarioPath
	 * @param {string} scenarioPath
	 * @returns {Object} scenario
	 */
	_loadScenarioFromPath(scenarioPath) {
		return require(scenarioPath);
	}

	/**
	 * Starts single test instance with all dependencies
	 * @returns {Promise}
	 */
	async _startInstance() {
		while (
			!this._config.randomScenariosDisabled &&
			this._isAllowedToStartNewScenario() ||
			this._scenariosHandler.hasScenario()
		) {
			let scenario = this._scenariosHandler.getScenario();
			let instance = await this._getBrowserInstance();
			let results;

			this._reporter.emit('runner:start', {
				scenario,
				instance
			});

			try {
				results = await scenario(instance);
			} catch (error) {
				this._reporter.emit('runner:error', {
					scenario,
					instance,
					error
				});
			}

			if (results && results.errors && results.errors.length > 0) {
				this._isSuccess = false;
				this._scenariosHandler.addFailingScenario(results);
			}

			await instance.clear();

			this._reporter.emit('runner:end');
		}
	}

	/**
	 * Checks if new scenarios are allowed based on configuration
	 * @returns {Boolean}
	 */
	_isAllowedToStartNewScenario() {
		if (this._config.stopNewScenariosAfterTime === 0) {
			return true;
		}

		return (new Date().getTime() - this._initTime) < this._config.stopNewScenariosAfterTime;
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
		this._initConfig();
		this._initReporter();
		this._initActionsHandler();
		this._initScenariosHandler();
		this._initTime = new Date().getTime();
	}

	/**
	 * Initializes config
	 */
	_initConfig() {
		this._config = Config.load(this._config);
	}

	/**
	 * Initializes Reporter instance
	 */
	_initReporter() {
		this._reporter = new Reporter(this._config).init();
	}

	/**
	 * Initializes ActionsHandler instance
	 */
	_initActionsHandler() {
		this._actionsHandler = new ActionsHandler(this._config, this._reporter).init();
	}

	/**
	 * Initializes ScenariosHandler instance
	 */
	_initScenariosHandler() {
		this._scenariosHandler = new ScenariosHandler(this._config, this._actionsHandler, this._reporter).init();
	}
}
