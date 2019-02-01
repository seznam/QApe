import * as messanger from '../../messanger';
import RandomScenarios from '../RandomScenarios';

describe('RandomScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		messanger.report = jest.fn();
		scenarios = new RandomScenarios({}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._actionsHandler).toEqual({});
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

		let results = await scenarios.runScenario(instance);

		expect(messanger.report)
			.toHaveBeenCalledWith('scenario:start', { type: 'random' });
		expect(page.goto).toHaveBeenCalledWith('url');
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledTimes(2);
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledWith(null, null, instance);
		expect(messanger.report)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'random',
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

		let results = await scenarios.runScenario(instance);

		expect(messanger.report)
			.toHaveBeenCalledWith('scenario:start', { type: 'random' });
		expect(page.goto).toHaveBeenCalledWith('url');
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledTimes(3);
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledWith(null, null, instance);
		expect(messanger.report)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'random',
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

		let results = await scenarios.runScenario(instance);

		expect(messanger.report)
			.toHaveBeenCalledWith('scenario:start', { type: 'random' });
		expect(page.goto).toHaveBeenCalledWith('url');
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledTimes(2);
		expect(scenarios._actionsHandler.execute)
			.toHaveBeenCalledWith(null, null, instance);
		expect(messanger.report)
			.toHaveBeenCalledWith('scenario:end', {
				type: 'random',
				results
			});
		expect(results).toEqual({
			scenario: [],
			errors: [],
			executionError: jasmine.any(Error)
		});
	});
});
