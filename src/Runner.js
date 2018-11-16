import Browser from './browser/Browser';
import Scenarios from './scenarios/Scenarios';
import Reporter from './reporter/BaseReporter';
import ActionsHandler from './actions/ActionsHandler';
import Config from './config/Config';
import fs from 'fs';
import path from 'path';

export default class Runner {
	constructor(config) {
		this._config = config;
		this._scenarios = null;
		this._actionsHandler = null;
		this._reporter = null;
		this._initTime = null;
		this._isSuccess = true;
	}

	start(files = []) {
		this._init();

		if (files.length > 0) {
			this._loadUserDefinedScenarios(files);
		}

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

	_loadUserDefinedScenarios(files) {
		files.forEach(file => {
			let scenarioPath = path.join(process.cwd(), file);

			if (!fs.existsSync(scenarioPath)) {
				console.error(`Failed to load scenario at path "${scenarioPath}". File does not exist!`);
				return;
			}

			let scenario = require(scenarioPath);

			this._scenarios.addUserDefinedScenario(scenario);
		});
	}

	async _startInstance() {
		while (
			!this._config.randomScenariosDisabled &&
			this._isAllowedToStartNewScenario() ||
			this._scenarios.hasScenario()
		) {
			let scenario = this._scenarios.getScenario();
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
				this._scenarios.addFailingScenario(results);
			}

			await instance.clear();

			this._reporter.emit('runner:end');
		}
	}

	_isAllowedToStartNewScenario() {
		if (this._config.stopNewScenariosAfterTime === 0) {
			return true;
		}

		return (new Date().getTime() - this._initTime) < this._config.stopNewScenariosAfterTime;
	}

	_getBrowserInstance() {
		return new Browser(this._config).initBrowser();
	}

	_init() {
		this._initConfig();
		this._initActionsHandler();
		this._initReporter();
		this._initScenarios();
		this._initTime = new Date().getTime();
	}

	_initConfig() {
		this._config = new Config().load(this._config);
	}

	_initActionsHandler() {
		this._actionsHandler = new ActionsHandler(this._config).init();
	}

	_initReporter() {
		this._reporter = new Reporter(this._config).init();
	}

	_initScenarios() {
		this._scenarios = new Scenarios(this._config, this._actionsHandler, this._reporter).init();
	}
}
