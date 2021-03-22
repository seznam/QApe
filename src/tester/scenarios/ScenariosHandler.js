import DefinedScenarios from './DefinedScenarios';
import RandomScenarios from './RandomScenarios';
import FailingScenarios from './FailingScenarios';
import ScenariosHelper from './ScenariosHelper';

/**
 * Handles scenarios execution and
 * initializes necessary dependencies
 */
export default class ScenariosHandler {
    /**
     * @param {Object} config
     * @param {ActionsHandler} actionsHandler
     */
    constructor(config, actionsHandler) {
        this._config = config;

        this._actionsHandler = actionsHandler;

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
        this._definedScenarios = new DefinedScenarios(this._config, this._scenariosHelper);
        this._failingScenarios = new FailingScenarios(this._config, this._scenariosHelper);
        this._randomScenarios = new RandomScenarios(this._config, this._actionsHandler);

        return this;
    }

    runScenario(instance, type, scenario) {
        if (type === 'defined') {
            return this._definedScenarios.runScenario(instance, scenario);
        }

        if (type === 'failing') {
            return this._failingScenarios.runScenario(instance, scenario);
        }

        return this._randomScenarios.runScenario(instance, scenario);
    }
}
