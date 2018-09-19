var Runner = require('./lib/Runner.js').default;

new Runner({
	"parallelInstances": 2,
	"noNewScenariosAfterTime": 450000,
	"actionsPerScenario": 100,
	"url": "https://www.seznamzpravy.cz",
	"actions": [],
	"numberOfAllowedActionsToReproduceErrorFromPreviousRun": 10
}).start();
