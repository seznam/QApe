import fs from 'fs';
import path from 'path';
import glob from 'glob-all';

/**
 * Handles scenarios execution order
 */
export default class ScenariosHandler {
    /**
     * @param {Object} config
     */
    constructor(config) {
        this._config = config;
        this._scenarios = {
            defined: [],
            failing: [],
        };
        this._initTime = null;
        this._urlPathsIndex = 0;
    }

    /**
     * Initializes default values
     * and loads defined scenarios
     */
    init() {
        this._loadDefinedScenarios();
        this._initTime = new Date().getTime();

        return this;
    }

    /**
     * Returns available scenario with highest priority
     * 1) FailingScenario
     * 2) DefinedScenario
     * 3) RandomScenario (if allowed by config)
     * @returns {Object}
     */
    getScenario() {
        if (this._scenarios.failing.length > 0) {
            return {
                type: 'failing',
                scenario: this._scenarios.failing.shift(),
            };
        }

        if (this._scenarios.defined.length > 0) {
            return {
                type: 'defined',
                scenario: this._scenarios.defined.shift(),
            };
        }

        if (this._isAllowedToStartRandomScenario()) {
            return {
                type: 'random',
                scenario: { startUrl: this._getRandomScenarioStartUrl() },
            };
        }

        return {};
    }

    addFailingScenario(scenario) {
        this._scenarios.failing.push(scenario);
    }

    /**
     * Checks if new random scenarios are allowed based on configuration
     * @returns {boolean}
     */
    _isAllowedToStartRandomScenario() {
        if (this._config.randomScenariosDisabled) {
            return false;
        }

        if (this._config.stopNewScenariosAfterTime === 0) {
            return true;
        }

        return new Date().getTime() - this._initTime < this._config.stopNewScenariosAfterTime;
    }

    /**
     * Loads all user defined scenarios specified in config
     */
    _loadDefinedScenarios() {
        glob.sync(this._config.files).forEach(file => {
            let scenarioPath = path.join(process.cwd(), file);

            if (!fs.existsSync(scenarioPath)) {
                console.error(`Failed to load scenario at path "${scenarioPath}". File does not exist!`);
                return;
            }

            let scenario = this._loadScenarioFromPath(scenarioPath);

            this._scenarios.defined.push(scenario);
        });
    }

    /**
     * Loads a scenario from specified scenarioPath
     * @param {string} scenarioPath
     * @returns {Object} scenario
     */
    _loadScenarioFromPath(scenarioPath) {
        let scenario = require(scenarioPath);

        if (!scenario.name) {
            scenario.name = scenarioPath;
        }

        return scenario;
    }

    /**
     * Loads a start url for scenario from specified url paths
     * @returns {string} start url
     */
    _getRandomScenarioStartUrl() {
        const { urlPaths } = this._config;

        if (this._urlPathsIndex >= urlPaths.length) {
            this._urlPathsIndex = 0;
        }

        return this._config.url + urlPaths[this._urlPathsIndex++];
    }
}
