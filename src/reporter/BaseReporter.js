import EventEmitter from 'events';
import ConsoleReporter from './ConsoleReporter';
import FileReporter from './FileReporter';
import SpinnerReporter from './SpinnerReporter';

/**
 * Base Reporter distributing events to all defined reporters
 */
export default class BaseReporter extends EventEmitter {
	/**
	 * @param {Object} config
	 * @param {Object} instanceInfo
	 */
	constructor(config, instanceInfo) {
		super();

		this._config = config;

		this._instanceInfo = instanceInfo;

		this._reporters = [];
	}

	/**
	 * Initializes all reporters defined in config
	 */
	init() {
		if (!this._config.reporters) {
			this._initReporterFromClass(DefaultReporter);
			return this;
		}

		this._config.reporters.forEach(reporter => {
			if (reporter === 'console') {
				return this._initReporterFromClass(ConsoleReporter);
			}

			if (reporter === 'file') {
				return this._initReporterFromClass(FileReporter);
			}

			if (reporter === 'spinner') {
				return this._initReporterFromClass(SpinnerReporter);
			}

			if (typeof reporter === 'string') {
				return this._initReporterFromString(reporter);
			}

			if (typeof reporter === 'function') {
				return this._initReporterFromClass(reporter);
			}

			throw Error('Failed to initalize custom reporter. Reporter must be defined via Class, or string.');
		});

		return this;
	}

	/**
	 * Emits an event with data
	 * and propagets it to all reporters
	 * @param {string} eventName
	 * @param {object} eventData
	 */
	emit(eventName, eventData) {
		this._reporters
			.forEach(reporter => {
				try {
					reporter.emit(eventName, eventData)
				} catch (e) {
					console.error(e);
				}
			});
	}

	/**
	 * Initializes a reporter from string
	 * @param {string} reporter
	 */
	_initReporterFromString(reporter) {
		const reporterPath = `qape-reporter-${reporter}`;
		const Reporter = require(reporterPath).default;

		this._initReporterFromClass(Reporter);
	}

	/**
	 * Initializes a reporter from a class constructor
	 * @param {Class} Reporter
	 */
	_initReporterFromClass(Reporter) {
		let instance = new Reporter(this._config);

		this._reporters.push(instance);
	}
}