import RandomScenarios from '../RandomScenarios';

describe('RandomScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new RandomScenarios({}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._actionsHandler).toEqual({});
	});
});
