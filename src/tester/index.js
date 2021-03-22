import Runner from './Runner';

/** @module tester */

/**
 * Initializes a tester worker.
 * It handles the test execution.
 * @memberof tester
 * @param {Object} config
 * @returns {Runner}
 */
export default (config) => {
    return new Runner(config)
        .start()
        .then(() => process.exit())
        .catch((error) => {
            if (error) {
                console.error(error);
            }

            process.exit(1);
        });
};
