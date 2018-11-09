import FailingScenariosHandler from '../FailingScenariosHandler';

describe('FailingScenariosHandler', () => {
	let scenariosHandler = null;

	beforeEach(() => {
		scenariosHandler = new FailingScenariosHandler({}, {}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHandler._config).toEqual({});
		expect(scenariosHandler._scenariosHelper).toEqual({});
		expect(scenariosHandler._reporter).toEqual({});
		expect(scenariosHandler._scenarios).toEqual([]);
	});
});
