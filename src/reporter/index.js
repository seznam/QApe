import Reporter from './reporter/Reporter';

/** @module reporter */

/**
 * Initializes reporter worker.
 * It handles all the test results and the distribution
 * to all defined reporters.
 * @memberof reporter
 * @param {Object} config
 */
export default (config) => {
	let reporter = new Reporter(config).init();

	process.on('message', ({ eventName, eventData }) => {
		if (config.debug) {
			console.log(eventName, '-', eventData);
		}

		reporter.emit(eventName, eventData);
	});
}
