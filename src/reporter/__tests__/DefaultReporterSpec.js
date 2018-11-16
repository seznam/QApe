import Reporter from '../DefaultReporter';

describe('Reporter', () => {
	let reporter = null;

	beforeEach(() => {
		reporter = new Reporter({}, {});
	});

	it('can be initialized', () => {
		expect(reporter._config).toEqual({});
		expect(reporter._results).toEqual([]);
	});
});
