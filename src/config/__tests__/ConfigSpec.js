import Config from '../Config';

describe('Config', () => {
	let config = null;

	beforeEach(() => {
		config = new Config({});
	});

	it('can be initialized', () => {
		expect(config._config).toEqual({});
	});
});
