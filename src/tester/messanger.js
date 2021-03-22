/** @module messanger */

/**
 * Sends a message to the reporter
 * @memberof messanger
 * @param {string} eventName
 * @param {*} eventData
 */
export function report(eventName, eventData) {
    process.send({ reciever: 'reporter', eventName, eventData });
}

/**
 * Requests a scenario from the scripwriter
 * @memberof messanger
 * @returns {Promise<Object>} Resolves with scenario,
 * or an empty object
 */
export function requestScenario() {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve({}), 5000);

        process.once('message', (scenario) => {
            clearTimeout(timeout);
            resolve(scenario);
        });
        process.send({ reciever: 'scriptwriter', eventName: 'GET' });
    });
}

/**
 * Sends a failing scenario to the scripwriter
 * @memberof messanger
 * @param {Object} scenario
 */
export function sendFailingScenario(scenario) {
    process.send({ reciever: 'scriptwriter', eventName: 'POST', eventData: scenario });
}
