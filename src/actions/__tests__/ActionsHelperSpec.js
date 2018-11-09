import ActionsHelper from '../ActionsHelper';

describe('ActionsHelper', () => {
	let actionsHelper = null;

	beforeEach(() => {
		actionsHelper = new ActionsHelper({});
	});

	it('can be initialized', () => {
		expect(actionsHelper._config).toEqual({});
	});
});
