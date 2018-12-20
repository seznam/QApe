import DefinedScenarios from './DefinedScenarios';
import RandomScenarios from './RandomScenarios';
import FailingScenarios from './FailingScenarios';
import ScenariosHelper from './ScenariosHelper';

/**
 * Handles scenarios execution order and
 * initializes necessary dependencies
 */
export default class ScenariosHandler {
	/**
	 * @param {Object} config
	 * @param {ActionsHandler} actionsHandler
	 * @param {Reporter} reporter
	 */
	constructor(config, actionsHandler, reporter) {
		this._config = config;

		this._actionsHandler = actionsHandler;

		this._reporter = reporter;

		this._scenariosHelper = null;

		this._definedScenarios = null;

		this._failingScenarios = null;

		this._randomScenarios = null;
	}

	/**
	 * Initializes all dependencies
	 * @returns {ScenariosHandler}
	 */
	init() {
		this._scenariosHelper = new ScenariosHelper(this._config, this._actionsHandler);
		this._definedScenarios = new DefinedScenarios(this._config, this._scenariosHelper, this._reporter);
		this._failingScenarios = new FailingScenarios(this._config, this._scenariosHelper, this._reporter);
		this._randomScenarios = new RandomScenarios(this._config, this._actionsHandler, this._reporter);

		return this;
	}

	/**
	 * Adds the defined scenario to execution list
	 * @param {Object} scenario
	 */
	addDefinedScenario(scenario) {
		this._definedScenarios.addScenario(scenario);
	}

	/**
	 * Adds the failing scenario to execution list
	 * @param {Object} scenario
	 */
	addFailingScenario(scenario) {
		this._failingScenarios.addScenario(scenario);
	}

	/**
	 * Returns available scenario with highest priority
	 * 1) FailingScenario
	 * 2) DefinedScenario
	 * 3) RandomScenario (if allowed by config)
	 * @returns {Function|undefined}
	 */
	getScenario() {
		if (this._failingScenarios.hasScenario()) {
			return this._failingScenarios.getScenario();
		}

		if (this._definedScenarios.hasScenario()) {
			return this._definedScenarios.getScenario();
		}

		if (this._config.randomScenariosDisabled) {
			return;
		}

		return this._randomScenarios.getScenario();
	}

	/**
	 * @returns {boolean} True if defined or failing scenario
	 * is available.
	 */
	hasScenario() {
		return this._definedScenarios.hasScenario() ||
			this._failingScenarios.hasScenario();
	}
}
