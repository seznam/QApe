import AbstractAction from './AbstractAction';

/**
 * Click action, which will click on random
 * or specific (if actionConfig is passed) page element
 * @extends AbstractAction
 */
export default class ClickAction extends AbstractAction {
    /**
     * @returns {string} 'click'
     */
    static get id() {
        return 'click';
    }

    /**
     * Click action should be always possible
     * @returns {boolean} true
     */
    static isActionAvailable() {
        return true;
    }

    /**
     * Performs the click action with following wrappers:
     * - Hover over the element
     * (So that in preview mode, you will see the element before click)
     * - Signal click on the element (Only in headfull mode)
     * - Click on the element
     * @param {puppeteer.Page} page
     * @param {puppeteer.ElementHandle} element
     * @returns {Promise} Resolves when click is done
     */
    async action(element, page) {
        await element.hover();

        if (this._config.headlessModeDisabled) {
            await this._actionsHelper.highlightElement(element);
            await page.waitFor(this._config.previewModePauseTime);
        }

        await element.click();
    }

    /**
     * Adds clicked element info to the action results
     * @param {Object} results
     * @returns {Object}
     */
    async updateResults(results) {
        return Object.assign({}, results, {
            message: `Click on ${results.html} [selector:"${results.config.selector}"]`,
        });
    }
}
