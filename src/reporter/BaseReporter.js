import EventEmitter from 'events';
import DefaultReporter from './DefaultReporter';

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
			if (reporter === 'default') {
				return this._initReporterFromClass(DefaultReporter);
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
			.forEach(reporter => reporter.emit(eventName, eventData));
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
