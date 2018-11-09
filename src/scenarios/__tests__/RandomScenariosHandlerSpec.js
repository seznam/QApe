import RandomScenariosHandler from '../RandomScenariosHandler';

describe('RandomScenariosHandler', () => {
	let scenariosHandler = null;

	beforeEach(() => {
		scenariosHandler = new RandomScenariosHandler({}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHandler._config).toEqual({});
		expect(scenariosHandler._actionsHandler).toEqual({});
	});
});
