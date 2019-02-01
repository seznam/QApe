jest.mock('fs');

import fs from 'fs';
import path from 'path';
import ScenariosHandler from '../ScenariosHandler';

const consoleErrorOrig = console.error;

describe('ScenariosHandler', () => {
	let scenariosHandler = null;

	beforeEach(() => {
		scenariosHandler = new ScenariosHandler({});
		console.error = jest.fn();
	});

	afterEach(() => {
		console.error = consoleErrorOrig;
	});

	it('can be initialized', () => {
		scenariosHandler._loadDefinedScenarios = jest.fn();

		scenariosHandler.init();

		expect(scenariosHandler._config).toEqual({});
		expect(scenariosHandler._scenarios).toEqual({
			defined: [],
			failing: []
		});
		expect(scenariosHandler._initTime).toEqual(jasmine.any(Number));
		expect(scenariosHandler._loadDefinedScenarios)
			.toHaveBeenCalledTimes(1);
	});

	it('can get scenario', () => {
		scenariosHandler._isAllowedToStartNewScenario = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		scenariosHandler._scenarios = {
			defined: ['definedScenario'],
			failing: ['failingScenario']
		};

		expect(scenariosHandler.getScenario())
			.toEqual({ type: 'failing', scenario: 'failingScenario' });
		expect(scenariosHandler.getScenario())
			.toEqual({ type: 'defined', scenario: 'definedScenario' });
		expect(scenariosHandler.getScenario())
			.toEqual({ type: 'random' });
		expect(scenariosHandler.getScenario())
			.toEqual({});
		expect(scenariosHandler._isAllowedToStartNewScenario)
			.toHaveBeenCalledTimes(2);
	});

	it('can add failing scenario', () => {
		scenariosHandler.addFailingScenario('scenario');

		expect(scenariosHandler._scenarios.failing)
			.toEqual(['scenario']);
	});

	it('can run forever when stopNewScenariosAfterTime is set to 0', () => {
		scenariosHandler._config = {
			stopNewScenariosAfterTime: 0
		};
		scenariosHandler._initTime = new Date().getTime() - 1;

		expect(scenariosHandler._isAllowedToStartNewScenario()).toEqual(true);
	});

	it('can stop new scenarios after stopNewScenariosAfterTime', () => {
		scenariosHandler._config = {
			stopNewScenariosAfterTime: 100
		};
		scenariosHandler._initTime = new Date().getTime() - 50;

		expect(scenariosHandler._isAllowedToStartNewScenario()).toEqual(true);

		scenariosHandler._initTime = new Date().getTime() - 101;

		expect(scenariosHandler._isAllowedToStartNewScenario()).toEqual(false);
	});

	it('can load defined scenarios', () => {
		scenariosHandler._config = {
			files: ['a']
		};
		fs.existsSync = jest.fn().mockReturnValue(true);
		scenariosHandler._loadScenarioFromPath = jest.fn(a => a);

		scenariosHandler._loadDefinedScenarios();

		expect(fs.existsSync)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		expect(scenariosHandler._loadScenarioFromPath)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		expect(scenariosHandler._scenarios.defined)
			.toEqual([path.join(process.cwd(), 'a')])
		fs.existsSync.mockRestore();
	});

	it('can can handle non-existing files when loading defined scenarios', () => {
		scenariosHandler._config = {
			files: ['a']
		};
		fs.existsSync = jest.fn().mockReturnValue(false);
		scenariosHandler._loadScenarioFromPath = jest.fn();

		scenariosHandler._loadDefinedScenarios();

		expect(fs.existsSync)
			.toHaveBeenCalledWith(path.join(process.cwd(), 'a'));
		expect(console.error)
			.toHaveBeenCalled();
		expect(scenariosHandler._loadScenarioFromPath)
			.not.toHaveBeenCalled();
		expect(scenariosHandler._scenarios.defined.length)
			.toEqual(0);
		fs.existsSync.mockRestore();
	});
});