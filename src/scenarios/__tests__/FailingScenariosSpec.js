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
});
