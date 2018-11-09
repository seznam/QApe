import Runner from '../Runner';

describe('Runner', () => {
	let runner = null;

	beforeEach(() => {
		runner = new Runner({});
	});

	it('can be initialized', () => {
		runner._initConfig = jest.fn();
		runner._initProgress = jest.fn();
		runner._initActionsHandler = jest.fn();
		runner._initReporter = jest.fn();
		runner._initScenarios = jest.fn();

		runner._init();

		expect(runner._initConfig).toHaveBeenCalledTimes(1);
		expect(runner._initProgress).toHaveBeenCalledTimes(1);
		expect(runner._initActionsHandler).toHaveBeenCalledTimes(1);
		expect(runner._initReporter).toHaveBeenCalledTimes(1);
		expect(runner._initScenarios).toHaveBeenCalledTimes(1);
		expect(runner._config).toEqual({});
		expect(runner._progress).toEqual(null);
		expect(runner._scenarios).toEqual(null);
		expect(runner._actionsHandler).toEqual(null);
		expect(runner._reporter).toEqual(null);
		expect(runner._initTime).toEqual(jasmine.any(Number));
	});
});
