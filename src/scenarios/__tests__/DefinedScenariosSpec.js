import DefinedScenarios from '../DefinedScenarios';

describe('DefinedScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new DefinedScenarios({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._scenariosHelper).toEqual({});
		expect(scenarios._reporter).toEqual({});
		expect(scenarios._scenarios).toEqual([]);
	});

	it('can get scenario type', () => {
		expect(scenarios.type).toEqual('defined');
	});

	it('can run defined scenario steps', async () => {
		let instance = 'instance';
		let scenario = ['action1', 'action2', 'action3'];
		let name = 'name';
		scenarios._scenarios = [{ scenario, name }];
		scenarios._reporter = {
			emit: jest.fn()
		};
		scenarios._scenariosHelper = {
			runScenario: jest.fn()
				.mockReturnValue({})
		};

		await scenarios.getScenario()(instance);

		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'defined',
				instance,
				name,
				scenario
			});
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'defined',
				instance,
				name,
				scenario,
				results: {}
			});
	});

	it('can run defined scenario steps and handle errors', async () => {
		let instance = 'instance';
		let scenario = ['action1', 'action2', 'action3'];
		let name = 'name';
		scenarios._config = {
			minifyUserDefinedScenarios: true
		};
		scenarios._scenarios = [{ scenario, name }];
		scenarios._reporter = {
			emit: jest.fn()
		};
		scenarios._scenariosHelper = {
			runScenario: jest.fn()
				.mockReturnValue({ errors: ['error']})
		};

		let results = await scenarios.getScenario()(instance);

		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'defined',
				instance,
				name,
				scenario
			});
		expect(scenarios._scenariosHelper.runScenario)
			.toHaveBeenCalledWith(instance, scenario);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'defined',
				instance,
				name,
				scenario,
				results
			});
		expect(results).toEqual({ errors: ['error'] });
	});
});
