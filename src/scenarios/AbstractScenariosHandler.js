export default class AbstractScenariosHandler {
	constructor(config, scenariosHelper, reporter) {
		this._config = config;

		this._scenariosHelper = scenariosHelper;

		this._reporter = reporter;

		this._scenarios = [];
	}

	addScenario(scenario) {
		this._scenarios.push(scenario);
	}

	getScenario() {
		return this._scenarios.shift();
	}

	hasScenario() {
		return this._scenarios.length > 0;
	}

	list() {
		return this._scenarios;
	}
}
