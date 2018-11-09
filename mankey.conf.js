module.exports = {
	url: 'http://localhost:4444',
	numberOfActionFailuresToAbortRandomScenario: 10/*,
	pageErrorHandler: () => {
		var interval = setInterval(() => {
			// if (window.$IMA && window.$IMA.$Dispatcher) {
			// 	$IMA.$Dispatcher.listen('page-error', ({ error }) => { mankeyError(error) });
			if (window) {
				window.addEventListener('error', (event) => {
					mankeyError(event.error.toString());
				});
				clearInterval(interval);
			}
		}, 100);
	}*/
}
