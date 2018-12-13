import UserDefinedScenarios from '../UserDefinedScenarios';

describe('UserDefinedScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new UserDefinedScenarios({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._scenariosHelper).toEqual({});
		expect(scenarios._reporter).toEqual({});
		expect(scenarios._scenarios).toEqual([]);
	});
});
