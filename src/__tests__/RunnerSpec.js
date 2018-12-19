jest.mock('../browser/Browser');
jest.mock('../scenarios/ScenariosHandler');
jest.mock('../reporter/Reporter');
jest.mock('../actions/ActionsHandler');
jest.mock('../config/Config');
jest.mock('fs');

import Runner from '../Runner';
import Browser from '../browser/Browser';
import ScenariosHandler from '../scenarios/ScenariosHandler';
import Reporter from '../reporter/Reporter';
import ActionsHandler from '../actions/ActionsHandler';
import Config from '../config/Config';
import path from 'path';
import fs from 'fs';

const consoleErrorOrig = console.error;

describe('Runner', () => {
	let runner = null;

	beforeEach(() => {
		runner = new Runner({});
		console.error = jest.fn();
	});

	afterEach(() => {
		console.error = consoleErrorOrig;
	});

	it('can be initialized', () => {
		runner._initConfig = jest.fn();
		runner._initActionsHandler = jest.fn();
		runner._initReporter = jest.fn();
		runner._initScenariosHandler = jest.fn();

		runner._init();

		expect(runner._initConfig).toHaveBeenCalledTimes(1);
		expect(runner._initActionsHandler).toHaveBeenCalledTimes(1);
		expect(runner._initReporter).toHaveBeenCalledTimes(1);
		expect(runner._initScenariosHandler).toHaveBeenCalledTimes(1);
		expect(runner._config).toEqual({});
		expect(runner._scenariosHandler).toEqual(null);
		expect(runner._actionsHandler).toEqual(null);
		expect(runner._reporter).toEqual(null);
		expect(runner._initTime).toEqual(jasmine.any(Number));
	});

	it('can start QApe run and handle success', async () => {
		runner._init = jest.fn();
		runner._loadDefinedScenarios = jest.fn();
		runner._startInstance = jest.fn().mockReturnValue(Promise.resolve());
		runner._config = {
			parallelInstances: 2
		};

		await runner.start();

		expect(runner._init).toHaveBeenCalled();
		expect(runner._loadDefinedScenarios).toHaveBeenCalled();
		expect(runner._startInstance).toHaveBeenCalledTimes(2);
	});

	it('can start QApe run and handle error', async () => {
		runner._init = jest.fn();
		runner._loadDefinedScenarios = jest.fn();
		runner._startInstance = jest.fn().mockReturnValue(Promise.resolve());
		runner._config = {
			parallelInstances: 2
		};
		runner._isSuccess = false;

		let rejected = false;

		try {
			await runner.start()
		} catch (e) {
			rejected = true;
		}

		expect(rejected).toEqual(true);
		expect(runner._init).toHaveBeenCalled();
		expect(runner._loadDefinedScenarios).toHaveBeenCalled();
		expect(runner._startInstance).toHaveBeenCalledTimes(2);
	});

	it('can load defined scenarios', () => {
		runner._config = {
			files: ['a']
		};
		fs.existsSync = jest.fn().mockReturnValue(true);
		runner._loadScenarioFromPath = jest.fn(a => a);
		runner._scenariosHandler = {
			addDefinedScenario: jest.fn()
		};

		runner._loadDefinedScenarios();

		expect(fs.existsSync)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		expect(runner._loadScenarioFromPath)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		expect(runner._scenariosHandler.addDefinedScenario)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		fs.existsSync.mockRestore();
	});

	it('can can handle non-existing files when loading defined scenarios', () => {
		runner._config = {
			files: ['a']
		};
		fs.existsSync = jest.fn().mockReturnValue(false);
		runner._loadScenarioFromPath = jest.fn();
		runner._scenariosHandler = {
			addDefinedScenario: jest.fn()
		};

		runner._loadDefinedScenarios();

		expect(fs.existsSync)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		expect(console.error)
			.toHaveBeenCalled();
		expect(runner._loadScenarioFromPath)
			.not.toHaveBeenCalled();
		expect(runner._scenariosHandler.addDefinedScenario)
			.not.toHaveBeenCalled();
		fs.existsSync.mockRestore();
	});

	it('can start a test instance and handle run without errors', async () => {
		let instance = { clear: jest.fn() };
		let scenario = jest.fn()
			.mockReturnValue(Promise.resolve());
		runner._config = {
			randomScenariosDisabled: false
		};
		runner._isAllowedToStartNewScenario = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		runner._scenariosHandler = {
			hasScenario: jest.fn()
				.mockReturnValue(false),
			getScenario: jest.fn()
				.mockReturnValue(scenario)
		};
		runner._getBrowserInstance = jest.fn()
			.mockReturnValue(Promise.resolve(instance));
		runner._reporter = {
			emit: jest.fn()
		};

		await runner._startInstance();

		expect(runner._isAllowedToStartNewScenario)
			.toHaveBeenCalledTimes(2);
		expect(runner._scenariosHandler.hasScenario)
			.toHaveBeenCalledTimes(1);
		expect(runner._scenariosHandler.getScenario)
			.toHaveBeenCalledTimes(1);
		expect(runner._getBrowserInstance)
			.toHaveBeenCalledTimes(1);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:start', {
				scenario,
				instance
			});
		expect(scenario).toHaveBeenCalledWith(instance);
		expect(instance.clear).toHaveBeenCalledTimes(1);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:end');
	});

	it('can start a test instance and handle run with page errors', async () => {
		let instance = { clear: jest.fn() };
		let scenario = jest.fn()
			.mockReturnValue(Promise.resolve({
				errors: ['error']
			}));
		runner._config = {
			randomScenariosDisabled: false
		};
		runner._isAllowedToStartNewScenario = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		runner._scenariosHandler = {
			hasScenario: jest.fn()
				.mockReturnValue(false),
			getScenario: jest.fn()
				.mockReturnValue(scenario),
			addFailingScenario: jest.fn()
		};
		runner._getBrowserInstance = jest.fn()
			.mockReturnValue(Promise.resolve(instance));
		runner._reporter = {
			emit: jest.fn()
		};

		await runner._startInstance();

		expect(runner._isAllowedToStartNewScenario)
			.toHaveBeenCalledTimes(2);
		expect(runner._scenariosHandler.hasScenario)
			.toHaveBeenCalledTimes(1);
		expect(runner._scenariosHandler.getScenario)
			.toHaveBeenCalledTimes(1);
		expect(runner._getBrowserInstance)
			.toHaveBeenCalledTimes(1);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:start', {
				scenario,
				instance
			});
		expect(scenario).toHaveBeenCalledWith(instance);
		expect(runner._isSuccess).toEqual(false);
		expect(runner._scenariosHandler.addFailingScenario)
			.toHaveBeenCalledWith({ errors: ['error'] });
		expect(instance.clear).toHaveBeenCalledTimes(1);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:end');
	});

	it('can start a test instance and handle run with execution errors', async () => {
		let instance = { clear: jest.fn() };
		let scenario = jest.fn()
			.mockReturnValue(Promise.reject('executionError'));
		runner._config = {
			randomScenariosDisabled: false
		};
		runner._isAllowedToStartNewScenario = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		runner._scenariosHandler = {
			hasScenario: jest.fn()
				.mockReturnValue(false),
			getScenario: jest.fn()
				.mockReturnValue(scenario)
		};
		runner._getBrowserInstance = jest.fn()
			.mockReturnValue(Promise.resolve(instance));
		runner._reporter = {
			emit: jest.fn()
		};

		await runner._startInstance();

		expect(runner._isAllowedToStartNewScenario)
			.toHaveBeenCalledTimes(2);
		expect(runner._scenariosHandler.hasScenario)
			.toHaveBeenCalledTimes(1);
		expect(runner._scenariosHandler.getScenario)
			.toHaveBeenCalledTimes(1);
		expect(runner._getBrowserInstance)
			.toHaveBeenCalledTimes(1);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:start', {
				scenario,
				instance
			});
		expect(scenario).toHaveBeenCalledWith(instance);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:error', {
				scenario,
				instance,
				error: 'executionError'
			});
		expect(instance.clear).toHaveBeenCalledTimes(1);
		expect(runner._reporter.emit)
			.toHaveBeenCalledWith('runner:end');
	});

	it('can run forever whet stopNewScenariosAfterTime is set to 0', () => {
		runner._config = {
			stopNewScenariosAfterTime: 0
		};
		runner._initTime = new Date().getTime() - 1;

		expect(runner._isAllowedToStartNewScenario()).toEqual(true);
	});

	it('can stop new scenarios after stopNewScenariosAfterTime', () => {
		runner._config = {
			stopNewScenariosAfterTime: 100
		};
		runner._initTime = new Date().getTime() - 50;

		expect(runner._isAllowedToStartNewScenario()).toEqual(true);

		runner._initTime = new Date().getTime() - 101;

		expect(runner._isAllowedToStartNewScenario()).toEqual(false);
	});

	it('can initialize all dependencies', () => {
		runner._initConfig = jest.fn();
		runner._initReporter = jest.fn();
		runner._initActionsHandler = jest.fn();
		runner._initScenariosHandler = jest.fn();

		runner._init();

		expect(runner._initConfig).toHaveBeenCalledTimes(1);
		expect(runner._initReporter).toHaveBeenCalledTimes(1);
		expect(runner._initActionsHandler).toHaveBeenCalledTimes(1);
		expect(runner._initScenariosHandler).toHaveBeenCalledTimes(1);
		expect(runner._initTime).toEqual(jasmine.any(Number));
	});

	it('can get browser instance', () => {
		let instance = {
			initBrowser: jest.fn().mockReturnValue('instance')
		};
		Browser.mockImplementation(() => instance);

		expect(runner._getBrowserInstance())
			.toEqual('instance');
		expect(instance.initBrowser)
			.toHaveBeenCalled();
		Browser.mockRestore();
	});

	it('can initialize config', () => {
		runner._config = 'preConfig';
		Config.load = jest.fn().mockReturnValue('postConfig');

		runner._initConfig();

		expect(runner._config).toEqual('postConfig');
		expect(Config.load).toHaveBeenCalledWith('preConfig');
		Config.mockRestore();
	});

	it('can initialize reporter', () => {
		let reporter = {
			init: jest.fn().mockReturnValue('reporter')
		};
		Reporter.mockImplementation(() => reporter);

		runner._initReporter();

		expect(runner._reporter).toEqual('reporter');
		expect(reporter.init).toHaveBeenCalled();
		Reporter.mockRestore();
	});

	it('can initialize actions handler', () => {
		let actionsHandler = {
			init: jest.fn().mockReturnValue('actionsHandler')
		};
		ActionsHandler.mockImplementation(() => actionsHandler);

		runner._initActionsHandler();

		expect(runner._actionsHandler).toEqual('actionsHandler');
		expect(actionsHandler.init).toHaveBeenCalled();
		ActionsHandler.mockRestore();
	});

	it('can initialize scenarios handler', () => {
		let scenariosHandler = {
			init: jest.fn().mockReturnValue('scenariosHandler')
		};
		ScenariosHandler.mockImplementation(() => scenariosHandler);

		runner._initScenariosHandler();

		expect(runner._scenariosHandler).toEqual('scenariosHandler');
		expect(scenariosHandler.init).toHaveBeenCalled();
		ScenariosHandler.mockRestore();
	});
});
