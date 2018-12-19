import ScenariosHelper from '../ScenariosHelper';

describe('ScenariosHelper', () => {
	let scenariosHelper = null;

	beforeEach(() => {
		scenariosHelper = new ScenariosHelper({}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHelper._config).toEqual({});
		expect(scenariosHelper._actionsHandler).toEqual({});
	});

	it('can run provided scenario', async () => {
		let page = {
			goto: jest.fn().mockReturnValue(Promise.resolve())
		};
		let instance = { page };
		let scenario = [{
			action: 'action',
			config: 'config',
			beforeLocation: 'beforeLocation'
		}];
		scenariosHelper._actionsHandler = {
			execute: jest.fn()
				.mockReturnValue(scenario[0])
		};

		let results = await scenariosHelper.runScenario(instance, scenario);

		expect(page.goto).toHaveBeenCalledWith('beforeLocation');
		expect(scenariosHelper._actionsHandler.execute)
			.toHaveBeenCalledWith('action', 'config', instance);
		expect(results).toEqual({
			scenario,
			errors: [],
			executionError: undefined
		});
	});

	it('can run provided scenario and handle navigation error', async () => {
		let page = {
			goto: jest.fn().mockReturnValue(Promise.reject('error'))
		};
		let instance = { page };
		let scenario = [{
			action: 'action',
			config: 'config',
			beforeLocation: 'beforeLocation'
		}];

		let results = await scenariosHelper.runScenario(instance, scenario);

		expect(page.goto).toHaveBeenCalledWith('beforeLocation');
		expect(results).toEqual({
			scenario: [],
			errors: [],
			executionError: jasmine.any(Error)
		});
	});

	it('can run provided scenario and handle missing beforeLocation', async () => {
		let instance = 'instance';
		let scenario = [{
			action: 'action',
			config: 'config'
		}];

		let results = await scenariosHelper.runScenario(instance, scenario);

		expect(results).toEqual({
			scenario: [],
			errors: [],
			executionError: jasmine.any(Error)
		});
	});

	it('can run provided scenario and handle execution error', async () => {
		let page = {
			goto: jest.fn().mockReturnValue(Promise.resolve())
		};
		let instance = { page };
		let scenario = [{
			action: 'action',
			config: 'config',
			beforeLocation: 'beforeLocation'
		}];
		scenariosHelper._actionsHandler = {
			execute: jest.fn()
				.mockReturnValue(Object.assign({}, scenario[0], {
					executionError: 'executionError'
				}))
		};

		let results = await scenariosHelper.runScenario(instance, scenario);

		expect(page.goto).toHaveBeenCalledWith('beforeLocation');
		expect(scenariosHelper._actionsHandler.execute)
			.toHaveBeenCalledWith('action', 'config', instance);
		expect(results).toEqual({
			scenario: [Object.assign({}, scenario[0], {
				executionError: 'executionError'
			})],
			errors: [],
			executionError: 'executionError'
		});
	});

	it('can run provided scenario and handle a page error', async () => {
		let page = {
			goto: jest.fn().mockReturnValue(Promise.resolve())
		};
		let instance = { page };
		let scenario = [{
			action: 'action',
			config: 'config',
			beforeLocation: 'beforeLocation'
		}];
		scenariosHelper._actionsHandler = {
			execute: jest.fn()
				.mockReturnValue(Object.assign({}, scenario[0], {
					errors: ['error']
				}))
		};

		let results = await scenariosHelper.runScenario(instance, scenario);

		expect(page.goto).toHaveBeenCalledWith('beforeLocation');
		expect(scenariosHelper._actionsHandler.execute)
			.toHaveBeenCalledWith('action', 'config', instance);
		expect(results).toEqual({
			scenario: [Object.assign({}, scenario[0], {
				errors: ['error']
			})],
			errors: ['error'],
			executionError: undefined
		});
	});
});
