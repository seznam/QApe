jest.mock('../DefinedScenarios');
jest.mock('../RandomScenarios');
jest.mock('../FailingScenarios');
jest.mock('../ScenariosHelper');

import ScenariosHandler from '../ScenariosHandler';
import DefinedScenarios from '../DefinedScenarios';
import RandomScenarios from '../RandomScenarios';
import FailingScenarios from '../FailingScenarios';
import ScenariosHelper from '../ScenariosHelper';

describe('ScenariosHandler', () => {
	let scenariosHandler = null;

	beforeEach(() => {
		scenariosHandler = new ScenariosHandler({}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHandler._config).toEqual({});
		expect(scenariosHandler._actionsHandler).toEqual({});
		expect(scenariosHandler._scenariosHelper).toEqual(null);
		expect(scenariosHandler._definedScenarios).toEqual(null);
		expect(scenariosHandler._failingScenarios).toEqual(null);
		expect(scenariosHandler._randomScenarios).toEqual(null);
	});

	it('can initialize its dependencies', () => {
		scenariosHandler.init();

		expect(
			scenariosHandler._scenariosHelper instanceof ScenariosHelper
		).toBeTruthy();
		expect(
			scenariosHandler._definedScenarios instanceof DefinedScenarios
		).toBeTruthy();
		expect(
			scenariosHandler._failingScenarios instanceof FailingScenarios
		).toBeTruthy();
		expect(
			scenariosHandler._randomScenarios instanceof RandomScenarios
		).toBeTruthy();
	});

	it('can run random scenario', () => {
		let instance = 'instance';
		scenariosHandler._randomScenarios = {
			runScenario: jest.fn()
		};

		scenariosHandler.runScenario(instance, 'random');

		expect(scenariosHandler._randomScenarios.runScenario).toHaveBeenCalledWith(instance);
	});

	it('can run defined scenario', () => {
		let instance = 'instance';
		let scenario = 'scenario';
		scenariosHandler._definedScenarios = {
			runScenario: jest.fn()
		};

		scenariosHandler.runScenario(instance, 'defined', scenario);

		expect(scenariosHandler._definedScenarios.runScenario).toHaveBeenCalledWith(instance, scenario);
	});

	it('can run failing scenario', () => {
		let instance = 'instance';
		let scenario = 'scenario';
		scenariosHandler._failingScenarios = {
			runScenario: jest.fn()
		};

		scenariosHandler.runScenario(instance, 'failing', scenario);

		expect(scenariosHandler._failingScenarios.runScenario).toHaveBeenCalledWith(instance, scenario);
	});
});
