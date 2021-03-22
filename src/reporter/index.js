import Reporter from './reporter/Reporter';
import util from 'util';

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
            let date = new Date().toISOString();

            if (eventData) {
                console.log(date, '-', eventName, '-', util.inspect(eventData, { depth: null })); // eslint-disable-line no-console
            } else {
                console.log(date, '-', eventName); // eslint-disable-line no-console
            }
        }

        reporter.emit(eventName, eventData);
    });
};
