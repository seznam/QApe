import Browser from './browser/Browser';
import Scenarios from './scenarios/Scenarios';
import Reporter from './reporter/Reporter';
import ActionsHandler from './actions/ActionsHandler';
import Config from './config/Config';
import Progress from './progress/Progress';
import fs from 'fs';
import path from 'path';

export default class Runner {
	constructor(config) {
		this._config = config;
		this._progress = null;
		this._scenarios = null;
		this._actionsHandler = null;
		this._reporter = null;
		this._initTime = null;
	}

	start(files = []) {
		this._init();

		if (files.length > 0) {
			this._loadUserDefinedScenarios(files);
		}

		let instances = [];

		for (let i = 0; i < this._config.parallelInstances; i++) {
			let progressBar = this._progress.newBar(this._config.actionsPerScenario);

			instances.push(this._startScenario(progressBar));
		}

		return Promise.all(instances).then(() => {
			this._progress.terminate();
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

	async _startScenario(progressBar) {
		while (
			!this._config.randomScenariosDisabled &&
			this._isAllowedToStartNewScenario() ||
			this._scenarios.hasScenario()
		) {
			let scenario = this._scenarios.getScenario();

			if (!scenario) {
				console.log('No scenario recieved.');
				return;
			}

			let instance = await this._getBrowserInstance();
			let log;

			progressBar.tick(0, { info: '' });

			try {
				log = await scenario(instance, progressBar);
			} catch (e) {
				progressBar.tick(0, { info: e.toString() });
			}

			if (log && log.errors && log.errors.length > 0) {
				this._scenarios.addFailingScenario(log);
			}

			if (log && log.executionError) {
				console.log(log.executionError);
				progressBar.tick(0, { info: log.executionError });
			}

			await instance.clear();
		}
	}

	_isAllowedToStartNewScenario() {
		return (new Date().getTime() - this._initTime) < this._config.stopNewScenariosAfterTime;
	}

	_getBrowserInstance() {
		return new Browser(this._config).initBrowser();
	}

	_init() {
		this._initConfig();
		this._initProgress();
		this._initActionsHandler();
		this._initReporter();
		this._initScenarios();
		this._initTime = new Date().getTime();
	}

	_initConfig() {
		this._config = new Config().load(this._config);
	}

	_initProgress() {
		this._progress = new Progress(this._config);
	}

	_initActionsHandler() {
		this._actionsHandler = new ActionsHandler(this._config).init();
	}

	_initReporter() {
		this._reporter = new Reporter(this._config, this._actionsHandler);
	}

	_initScenarios() {
		this._scenarios = new Scenarios(this._config, this._actionsHandler, this._reporter).init();
	}
}
