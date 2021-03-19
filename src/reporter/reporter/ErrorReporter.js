import EventEmitter from 'events';
const isEqual = require('lodash.isequal');

/**
 * Console reporter
 * @extends EventEmitter
 */
export default class ErrorReporter extends EventEmitter {
    /**
     * @param {Object} config
     */
    constructor(config) {
        super();

        this._config = config;
        this._errors = [];

        this.on('scenario:end', eventData => this._handleScenarioEnd(eventData));
        this.on('action:error', eventData => this._handleError(eventData, 'action:error'));
        this.on('runner:error', eventData => this._handleError(eventData, 'runner:error'));
        this.on('browser:error', eventData => this._handleError(eventData, 'browser:error'));
        this.on('runner:end', () => this._handleRunnerEnd());
    }

    /**
     * Handler for scenario:end event
     * @param {Object} eventData
     */
    _handleScenarioEnd(eventData) {
        if (
            eventData.type === 'failing' &&
            eventData.minified &&
            !this._isFailureReported(eventData.scenario)
        ) {
            let { scenario, errors } = eventData;

            this._errors.push({ scenario, errors });
        }
    }

    /**
     * Handler for error event
     * @param {Object} eventData
     * @param {string} type
     */
    _handleError() {}

    /**
     * Handler for runner:end event
     */
    _handleRunnerEnd() {
        console.log('------- SUMMARY OF ERRORS -------');
        console.log(`Count of errors: ${this._errors.length}`);
        this._errors.forEach((error, index) => {
            console.log(
                `---- ${index + 1}. error ----\n
                -- Error: --\n
                ${error.errors}\n
                -- Steps to reproduce: --\n`
            );
            console.log(this._getScenarioReadable(error.scenario));
        });
    }

    /**
     * Make scenario readable
     * @param {Object[]} scenario
     * @returns {string}
     */
    _getScenarioReadable(scenario) {
        return (
            `- Go to ${scenario[0].beforeLocation}\n` + scenario.map(step => `- ${step.message}`).join('\n')
        );
    }

    /**
     * Check if error is already reported in errors
     * @param {Object[]} scenario
     * @returns {boolean}
     */
    _isFailureReported(scenario) {
        return !!this._errors.find(result => isEqual(result.scenario, scenario));
    }
}
