import UserDefinedScenarios from './UserDefinedScenarios';
import RandomScenarios from './RandomScenarios';
import FailingScenarios from './FailingScenarios';
import ScenariosHelper from './ScenariosHelper';

export default class ScenariosHandler {
	constructor(config, actionsHandler, reporter) {
		this._config = config;

		this._actionsHandler = actionsHandler;

		this._reporter = reporter;

		this._scenariosHelper = null;

		this._userDefinedScenarios = null;

		this._failingScenarios = null;

		this._randomScenarios = null;
	}

	init() {
		this._scenariosHelper = new ScenariosHelper(this._config, this._actionsHandler);
		this._userDefinedScenarios = new UserDefinedScenarios(this._config, this._scenariosHelper, this._reporter);
		this._failingScenarios = new FailingScenarios(this._config, this._scenariosHelper, this._reporter);
		this._randomScenarios = new RandomScenarios(this._config, this._actionsHandler, this._reporter);

		return this;
	}

	addUserDefinedScenario(scenario) {
		this._userDefinedScenarios.addScenario(scenario);
	}

	addFailingScenario(scenario) {
		this._failingScenarios.addScenario(scenario);
	}

	getScenario() {
		if (this._failingScenarios.hasScenario()) {
			return this._failingScenarios.getScenario();
		}

		if (this._userDefinedScenarios.hasScenario()) {
			return this._userDefinedScenarios.getScenario();
		}

		if (this._config.randomScenariosDisabled) {
			return;
		}

		return this._randomScenarios.getScenario();
	}

	hasScenario() {
		return this._userDefinedScenarios.hasScenario() ||
			this._failingScenarios.hasScenario();
	}

	list() {
		return [].concat(
			this._userDefinedScenarios.list(),
			this._failingScenarios.list()
		);
	}
}
