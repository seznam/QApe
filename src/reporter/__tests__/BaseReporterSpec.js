import BaseReporter from '../BaseReporter';
import DefaultReporter from '../DefaultReporter';
import EventEmitter from 'events';

class MockedReporter extends EventEmitter {}

describe('BaseReporter', () => {
	let reporter = null;

	beforeEach(() => {
		reporter = new BaseReporter({});
	});

	it('can be initialized', () => {
		expect(reporter._config).toEqual({});
		expect(reporter._reporters).toEqual([]);
	});

	it('can initialize all defined reporters', () => {
		let reporters = ['default', 'non-default', MockedReporter];
		reporter._config = { reporters };
		reporter._initReporterFromString = jest.fn();
		reporter._initReporterFromClass = jest.fn();

		reporter.init();

		expect(reporter._initReporterFromClass)
			.toHaveBeenCalledWith(DefaultReporter);
		expect(reporter._initReporterFromString)
			.toHaveBeenCalledWith(reporters[1]);
		expect(reporter._initReporterFromClass)
			.toHaveBeenCalledWith(reporters[2]);
	});

	it('can throw an error when reporter has an invalid format', () => {
		let reporters = [{}];
		reporter._config = { reporters };

		expect(reporter.init).toThrowError(Error, jasmine.any(String));
	});

	it('can emit an event for all defined reporters', () => {
		let reporterInstance = { emit: jest.fn() };
		reporter._reporters = [reporterInstance];
		let eventName = 'eventName';
		let data = 'data';

		reporter.emit(eventName, data);

		expect(reporterInstance.emit)
			.toHaveBeenCalledWith(eventName, data);
	});

	it('can initialize reporter from string', () => {

	});
});
