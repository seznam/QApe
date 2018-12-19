import FailingScenarios from '../FailingScenarios';

describe('FailingScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new FailingScenarios({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._scenariosHelper).toEqual({});
		expect(scenarios._reporter).toEqual({});
		expect(scenarios._scenarios).toEqual([]);
	});

	it('can get scenario type', () => {
		expect(scenarios.type).toEqual('failing');
	});

	it('can reproduce the error', async () => {
		let scenario = ['action1', 'action2', 'action3'];
		let errors = ['error'];
		let instance = 'instance';
		scenarios._scenarios = [{ scenario, errors }];
		scenarios._reporter = {
			emit: jest.fn()
		};
		scenarios._getNumberOfRetryActions = jest.fn()
			.mockReturnValue(3);
		scenarios._scenariosHelper = {
			runScenario: jest.fn()
				.mockReturnValueOnce(Promise.resolve({
					errors: [],
					scenario: scenario.slice(-1)
				}))
				.mockReturnValueOnce(Promise.resolve({
					errors: [],
					scenario: scenario.slice(-2)
				}))
				.mockReturnValue(Promise.resolve({
					errors,
					scenario
				}))
		};
		scenarios._reduceScenarioSteps = jest.fn()
			.mockReturnValue(Promise.resolve('minifiedScenario'));

		await scenarios.getScenario()(instance);

		expect(scenarios._scenarios.length).toEqual(0);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'failing',
				instance,
				scenario,
				errors
			});
		expect(scenarios._getNumberOfRetryActions)
			.toHaveBeenCalledWith(3);
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledTimes(3);
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario.slice(-1));
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario.slice(-2));
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario);
		expect(scenarios._reduceScenarioSteps)
			.toHaveBeenCalledWith(instance, scenario);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'failing',
				instance,
				minified: true,
				scenario: 'minifiedScenario',
				errors
			});
	});

	it('can handle unreproducible error', async () => {
		let scenario = ['action1', 'action2', 'action3'];
		let errors = ['error'];
		let instance = 'instance';
		scenarios._scenarios = [{ scenario, errors }];
		scenarios._reporter = {
			emit: jest.fn()
		};
		scenarios._getNumberOfRetryActions = jest.fn()
			.mockReturnValue(3);
		scenarios._scenariosHelper = {
			runScenario: jest.fn()
				.mockReturnValueOnce(Promise.resolve({
					errors: [],
					scenario: scenario.slice(-1)
				}))
				.mockReturnValueOnce(Promise.resolve({
					errors: [],
					scenario: scenario.slice(-2)
				}))
				.mockReturnValue(Promise.resolve({
					errors: [],
					scenario
				}))
		};

		await scenarios.getScenario()(instance);

		expect(scenarios._scenarios.length).toEqual(0);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'failing',
				instance,
				scenario,
				errors
			});
		expect(scenarios._getNumberOfRetryActions)
			.toHaveBeenCalledWith(3);
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledTimes(3);
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario.slice(-1));
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario.slice(-2));
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'failing',
				instance,
				minified: false,
				scenario,
				errors
			});
	});

	it('can get number of retry actions', () => {
		scenarios._config = {
			numberOfAllowedActionsToReproduceErrorFromPreviousRun: 5
		};

		expect(scenarios._getNumberOfRetryActions(2)).toEqual(2);
		expect(scenarios._getNumberOfRetryActions(10)).toEqual(5);
	});

	it('can reduce scenario steps', async () => {
		let instance = 'instance';
		let scenario = ['action1', 'action2', 'action3'];
		scenarios._scenariosHelper = {
			runScenario: jest.fn()
				.mockReturnValueOnce(Promise.resolve({
					errors: ['error']
				}))
				.mockReturnValue(Promise.resolve({
					errors: []
				}))
		};

		let minifiedScenario = await scenarios._reduceScenarioSteps(instance, scenario);

		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, [
				scenario[0],
				scenario[2]
			]);
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, [
				scenario[0]
			]);
		expect(minifiedScenario).toEqual([
			scenario[0],
			scenario[2]
		]);
	});
});
