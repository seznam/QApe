import AbstractScenariosHandler from '../AbstractScenariosHandler';

describe('AbstractScenariosHandler', () => {
	let scenariosHandler = null;

	beforeEach(() => {
		scenariosHandler = new AbstractScenariosHandler({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHandler._config).toEqual({});
		expect(scenariosHandler._scenariosHelper).toEqual({});
		expect(scenariosHandler._reporter).toEqual({});
		expect(scenariosHandler._scenarios).toEqual([]);
	});

	it('can add scenario', () => {
		let scenario = 'scenario';

		scenariosHandler.addScenario(scenario);

		expect(scenariosHandler._scenarios).toEqual([scenario]);
	});

	it('can get scenario', () => {
		let scenario = 'scenario';

		scenariosHandler.addScenario(scenario);

		expect(scenariosHandler.getScenario()).toEqual(scenario);
	});

	it('can check if there are any available scenarios (true)', () => {
		let scenario = 'scenario';

		scenariosHandler.addScenario(scenario);

		expect(scenariosHandler.hasScenario()).toEqual(true);
	});

	it('can check if there are any available scenarios (false)', () => {
		expect(scenariosHandler.hasScenario()).toEqual(false);
	});
});
