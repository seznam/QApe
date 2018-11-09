import ScenariosHelper from '../ScenariosHelper';

describe('ScenariosHelper', () => {
	let scenariosHelper = null;

	beforeEach(() => {
		scenariosHelper = new ScenariosHelper({}, {});
	});

	it('can be initialized', () => {
		expect(scenariosHelper._config).toEqual({});
		expect(scenariosHelper._actionsHandler).toEqual({});
	});
});
