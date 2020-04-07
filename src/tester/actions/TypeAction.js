import AbstractAction from './AbstractAction';
import faker from 'faker';
import { getRandomElementFromArray } from '../../shared/helpers';

/**
 * Type action, which will type a random text into a random
 * input element. Or a specific text into a specific element,
 * when actionsConfig is specified.
 * @extends AbstractAction
 */
export default class TypeAction extends AbstractAction {
    /**
     * @returns {string} 'type'
     */
    static get id() {
        return 'type';
    }

    /**
     * Checks if an elements is a typable input or textarea
     * @param {puppeteer.ElementHandle} element
     * @returns {boolean}
     */
    static isActionAvailable(element) {
        return element.executionContext().evaluate(element => {
            return element.matches(
                // Is typable input box
                'input' +
                    ':not([type="radio"])' +
                    ':not([type="checkbox"])' +
                    ':not([type="date"])' +
                    ':not(:disabled)' +
                    ':not([readonly])' +
                    // Is typable textarea
                    ', textarea' +
                    ':not(:disabled)' +
                    ':not([readonly])'
            );
        }, element);
    }

    /**
     * Performs the type action with following wrappers:
     * - Hover over the element
     * (So that in preview mode, you will see the element before typing)
     * - Highlight the element (Only in headfull mode)
     * - Type the configured or random text into the element
     * @param {puppeteer.ElementHandle} element
     * @param {puppeteer.Page} page
     * @returns {Promise} Resolves when typing is done
     */
    async action(element, page) {
        this._text = this._getText();

        await element.hover();

        if (this._config.headlessModeDisabled) {
            await this._actionsHelper.highlightElement(element);
            await page.waitFor(this._config.previewModePauseTime);
        }

        await element.type(this._text, { delay: this._config.typeActionDelay });
    }

    /**
     * @returns {string} Text from action config,
     * or random string the list of available texts
     */
    _getText() {
        if (this._actionConfig && this._actionConfig.text) {
            return this._actionConfig.text;
        }

        return faker.fake(`{{${getRandomElementFromArray(this._config.typeActionTextTypes)}}}`);
    }

    /**
     * Adds info to the action results
     * @param {Object} results
     * @returns {Object}
     */
    async updateResults(results) {
        results.config.text = this._text;
        results.message = `Type '${this._text}' into ${results.html} [selector:"${results.config.selector}"]`;

        return results;
    }
}
