import Runner from '../Runner';

describe('Runner', () => {
	let runner = null;

	beforeEach(() => {
		runner = new Runner({});
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
});
