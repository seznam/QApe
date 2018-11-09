import UserDefinedScenariosHandler from './UserDefinedScenariosHandler';
import RandomScenariosHandler from './RandomScenariosHandler';
import FailingScenariosHandler from './FailingScenariosHandler';
import ScenariosHelper from './ScenariosHelper';

export default class Scenarios {
	constructor(config, actionsHandler, reporter) {
		this._config = config;

		this._actionsHandler = actionsHandler;

		this._reporter = reporter;

		this._scenariosHelper = null;

		this._userDefinedScenariosHandler = null;

		this._failingScenariosHandler = null;

		this._randomScenariosHandler = null;
	}

	init() {
		this._scenariosHelper = new ScenariosHelper(this._config, this._actionsHandler);
		this._userDefinedScenariosHandler = new UserDefinedScenariosHandler(this._config, this._scenariosHelper, this._reporter);
		this._failingScenariosHandler = new FailingScenariosHandler(this._config, this._scenariosHelper, this._reporter);
		this._randomScenariosHandler = new RandomScenariosHandler(this._config, this._actionsHandler);

		return this;
	}

	addUserDefinedScenario(log) {
		this._userDefinedScenariosHandler.addScenario(log);
	}

	addFailingScenario(log) {
		this._failingScenariosHandler.addScenario(log);
	}

	getScenario() {
		if (this._failingScenariosHandler.hasScenario()) {
			return this._failingScenariosHandler.getScenario();
		}

		if (this._userDefinedScenariosHandler.hasScenario()) {
			return this._userDefinedScenariosHandler.getScenario();
		}

		if (this._config.randomScenariosDisabled) {
			return;
		}

		return this._randomScenariosHandler.getScenario();
	}

	hasScenario() {
		return this._userDefinedScenariosHandler.hasScenario() ||
			this._failingScenariosHandler.hasScenario();
	}
}
