import BaseReporter from '../BaseReporter';
import ConsoleReporter from '../ConsoleReporter';
import SpinnerReporter from '../SpinnerReporter';
import FileReporter from '../FileReporter';
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
		let reporters = ['spinner', 'console', 'file', 'non-default', MockedReporter];
		reporter._config = { reporters };
		reporter._initReporterFromString = jest.fn();
		reporter._initReporterFromClass = jest.fn();

		reporter.init();

		expect(reporter._initReporterFromClass)
			.toHaveBeenCalledWith(SpinnerReporter);
		expect(reporter._initReporterFromClass)
			.toHaveBeenCalledWith(ConsoleReporter);
		expect(reporter._initReporterFromClass)
			.toHaveBeenCalledWith(FileReporter);
		expect(reporter._initReporterFromString)
			.toHaveBeenCalledWith(reporters[3]);
		expect(reporter._initReporterFromClass)
			.toHaveBeenCalledWith(reporters[4]);
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
