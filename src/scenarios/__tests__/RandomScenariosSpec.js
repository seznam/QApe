import RandomScenarios from '../RandomScenarios';

describe('RandomScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new RandomScenarios({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._actionsHandler).toEqual({});
		expect(scenarios._reporter).toEqual({});
	});

	it('can get scenario type', () => {
		expect(scenarios.type).toEqual('random');
	});

	it('can reproduce some page errors', async () => {
		let page = {
			goto: jest.fn()
				.mockReturnValue(Promise.resolve())
		};
		let instance = { page };
		let scenario = [
			{ errors: [] },
			{ errors: ['error'] }
		];
		scenarios._config = {
			url: 'url',
			actionsPerScenario: 5
		};
		scenarios._actionsHandler = {
			execute: jest.fn()
				.mockReturnValueOnce(scenario[0])
				.mockReturnValue(scenario[1])
		};
		scenarios._reporter = {
			emit: jest.fn()
		};

		let results = await scenarios.getScenario()(instance);

		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'random',
				instance
			});
		expect(page.goto).toHaveBeenCalledWith('url');
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledTimes(2);
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledWith(null, null, instance);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'random',
				instance,
				results
			});
		expect(results).toEqual({
			scenario,
			errors: scenario[1].errors
		});
	});

	it('can pass when no error found', async () => {
		let page = {
			goto: jest.fn()
				.mockReturnValue(Promise.resolve())
		};
		let instance = { page };
		scenarios._config = {
			url: 'url',
			actionsPerScenario: 3
		};
		scenarios._actionsHandler = {
			execute: jest.fn()
				.mockReturnValue({ errors: [] })
		};
		scenarios._reporter = {
			emit: jest.fn()
		};

		let results = await scenarios.getScenario()(instance);

		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'random',
				instance
			});
		expect(page.goto).toHaveBeenCalledWith('url');
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledTimes(3);
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledWith(null, null, instance);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'random',
				instance,
				results
			});
		expect(results).toEqual({
			scenario: [
				{ errors: [] },
				{ errors: [] },
				{ errors: [] }
			],
			errors: []
		});
	});

	it('can throw an error when unable to perform any action successfully', async () => {
		let page = {
			goto: jest.fn()
				.mockReturnValue(Promise.resolve())
		};
		let instance = { page };
		scenarios._config = {
			url: 'url',
			actionsPerScenario: 3,
			numberOfActionFailuresToAbortRandomScenario: 2
		};
		scenarios._actionsHandler = {
			execute: jest.fn()
				.mockReturnValue({ executionError: 'executionError' })
		};
		scenarios._reporter = {
			emit: jest.fn()
		};

		let results = await scenarios.getScenario()(instance);

		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:start', {
				type: 'random',
				instance
			});
		expect(page.goto).toHaveBeenCalledWith('url');
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledTimes(2);
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledWith(null, null, instance);
		expect(scenarios._reporter.emit)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'random',
				instance,
				results
			});
		expect(results).toEqual({
			scenario: [],
			errors: [],
			executionError: jasmine.any(Error)
		});
	});
});
