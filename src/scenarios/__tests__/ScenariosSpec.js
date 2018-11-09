import Scenarios from '../Scenarios';

describe('Scenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new Scenarios({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._actionsHandler).toEqual({});
		expect(scenarios._reporter).toEqual({});
		expect(scenarios._scenariosHelper).toEqual(null);
		expect(scenarios._userDefinedScenariosHandler).toEqual(null);
		expect(scenarios._failingScenariosHandler).toEqual(null);
		expect(scenarios._randomScenariosHandler).toEqual(null);
	});

	it('can add user defined scenario', () => {
		let log = {};
		let userDefinedScenariosHandler = { addScenario: jest.fn() };
		scenarios._userDefinedScenariosHandler = userDefinedScenariosHandler;

		scenarios.addUserDefinedScenario(log);

		expect(userDefinedScenariosHandler.addScenario)
			.toHaveBeenCalledWith(log);
	});

	it('can add user defined scenario', () => {
		let log = {};
		let userDefinedScenariosHandler = { addScenario: jest.fn() };
		scenarios._userDefinedScenariosHandler = userDefinedScenariosHandler;

		scenarios.addUserDefinedScenario(log);

		expect(userDefinedScenariosHandler.addScenario)
			.toHaveBeenCalledWith(log);
	});

	it('can add failing scenario', () => {
		let log = {};
		let failingScenariosHandler = { addScenario: jest.fn() };
		scenarios._failingScenariosHandler = failingScenariosHandler;

		scenarios.addFailingScenario(log);

		expect(failingScenariosHandler.addScenario)
			.toHaveBeenCalledWith(log);
	});

	it('can get failing scenario', () => {
		let scenario = 'failingScenario';
		let failingScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(true),
			getScenario: jest.fn().mockReturnValue(scenario)
		};
		scenarios._failingScenariosHandler = failingScenariosHandler;

		let recievedScenario = scenarios.getScenario();

		expect(recievedScenario).toEqual(scenario);
		expect(failingScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
		expect(failingScenariosHandler.getScenario).toHaveBeenCalledTimes(1);
	});

	it('can get user defined scenario', () => {
		let scenario = 'userDefinedScenario';
		let failingScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(false)
		};
		scenarios._failingScenariosHandler = failingScenariosHandler;
		let userDefinedScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(true),
			getScenario: jest.fn().mockReturnValue(scenario)
		};
		scenarios._userDefinedScenariosHandler = userDefinedScenariosHandler;

		let recievedScenario = scenarios.getScenario();

		expect(recievedScenario).toEqual(scenario);
		expect(failingScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
		expect(userDefinedScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
		expect(userDefinedScenariosHandler.getScenario).toHaveBeenCalledTimes(1);
	});

	it('can get random scenario if enabled', () => {
		let scenario = 'randomScenario';
		let failingScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(false)
		};
		scenarios._failingScenariosHandler = failingScenariosHandler;
		let userDefinedScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(false)
		};
		scenarios._userDefinedScenariosHandler = userDefinedScenariosHandler;
		let randomScenariosHandler = {
			getScenario: jest.fn().mockReturnValue(scenario)
		}
		scenarios._randomScenariosHandler = randomScenariosHandler;

		let recievedScenario = scenarios.getScenario();

		expect(recievedScenario).toEqual(scenario);
		expect(failingScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
		expect(userDefinedScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
		expect(randomScenariosHandler.getScenario).toHaveBeenCalledTimes(1);
	});

	it('can get no scenario if random scenarios disabled', () => {
		let failingScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(false)
		};
		scenarios._failingScenariosHandler = failingScenariosHandler;
		let userDefinedScenariosHandler = {
			hasScenario: jest.fn().mockReturnValue(false)
		};
		scenarios._userDefinedScenariosHandler = userDefinedScenariosHandler;
		scenarios._config.randomScenariosDisabled = true;

		let recievedScenario = scenarios.getScenario();

		expect(recievedScenario).not.toBeDefined();
		expect(failingScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
		expect(userDefinedScenariosHandler.hasScenario).toHaveBeenCalledTimes(1);
	});

	it('has scenario when user defined scenario is available', () => {
		let userDefinedScenario = {
			hasScenario: jest.fn().mockReturnValue(true)
		}
		scenarios._userDefinedScenariosHandler = userDefinedScenario;

		expect(scenarios.hasScenario()).toEqual(true);
	});

	it('has scenario when failing scenario is available', () => {
		let failingScenario = {
			hasScenario: jest.fn().mockReturnValue(true)
		}
		scenarios._failingScenariosHandler = failingScenario;
		let userDefinedScenario = {
			hasScenario: jest.fn().mockReturnValue(false)
		}
		scenarios._userDefinedScenariosHandler = userDefinedScenario;

		expect(scenarios.hasScenario()).toEqual(true);
	});

	it('has no scenario when there is no failing and user defined scenario', () => {
		let failingScenario = {
			hasScenario: jest.fn().mockReturnValue(false)
		}
		scenarios._failingScenariosHandler = failingScenario;
		let userDefinedScenario = {
			hasScenario: jest.fn().mockReturnValue(false)
		}
		scenarios._userDefinedScenariosHandler = userDefinedScenario;

		expect(scenarios.hasScenario()).toEqual(false);
	});
});
