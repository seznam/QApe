import Scenarios from './scenarios/ScenariosHandler';

/** @module scriptwriter */

/**
 * Initializes a scriptwriter worker.
 * It handles scenarios distribution to the testers.
 * @memberof scriptwriter
 * @param {Object} config
 */
export default (config) => {
	let scenarios = new Scenarios(config).init();

	process.on('message', ({ eventName, eventData, workerId }) => {
		if (eventName === 'GET') {
			process.send({
				reciever: 'tester',
				eventData: scenarios.getScenario(),
				workerId
			});
		}

		if (eventName === 'POST') {
			scenarios.addFailingScenario(eventData);
		}
	});
}
