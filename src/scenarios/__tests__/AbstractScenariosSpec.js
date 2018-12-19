import AbstractScenarios from '../AbstractScenarios';

describe('AbstractScenarios', () => {
	let scenarios = null;

	beforeEach(() => {
		scenarios = new AbstractScenarios({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenarios._config).toEqual({});
		expect(scenarios._scenariosHelper).toEqual({});
		expect(scenarios._reporter).toEqual({});
		expect(scenarios._scenarios).toEqual([]);
	});

	it('can add scenario', () => {
		let scenario = 'scenario';

		scenarios.addScenario(scenario);

		expect(scenarios._scenarios).toEqual([scenario]);
	});

	it('can check if there are any available scenarios (true)', () => {
		let scenario = 'scenario';

		scenarios.addScenario(scenario);

		expect(scenarios.hasScenario()).toEqual(true);
	});

	it('can check if there are any available scenarios (false)', () => {
		expect(scenarios.hasScenario()).toEqual(false);
	});
});
