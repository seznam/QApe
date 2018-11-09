import UserDefinedScenariosHandler from '../UserDefinedScenariosHandler';

describe('UserDefinedScenariosHandler', () => {
	let scenariosHandler = null;

	beforeEach(() => {
		scenariosHandler = new UserDefinedScenariosHandler({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHandler._config).toEqual({});
		expect(scenariosHandler._scenariosHelper).toEqual({});
		expect(scenariosHandler._reporter).toEqual({});
		expect(scenariosHandler._scenarios).toEqual([]);
	});
});
