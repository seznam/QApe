import AbstractAction from './AbstractAction';

const BACK_CHANCE = 30;
/**
 * Back action, which will click on random
 * or specific (if actionConfig is passed) page element
 * @extends AbstractAction
 */
export default class BackAction extends AbstractAction {
    /**
     * @returns {string} 'back'
     */
    static get id() {
        return 'back';
    }

    /**
     * Back action should be always possible
     * @returns {boolean} true
     */
    static async isActionAvailable(element, page) {
        const historyLength = await page.evaluate(() => window.history.length);

        return historyLength > 2 && Math.floor(Math.random() * 100) <= BACK_CHANCE;
    }

    /**
     * Performs the back action on document
     * @param {puppeteer.Page} page
     * @param {puppeteer.ElementHandle} element
     * @returns {Promise} Resolves when back event is done
     */
    async action(element, page) {
        if (this._config.headlessModeDisabled) {
            await page.waitForTimeout(this._config.previewModePauseTime);
        }

        await Promise.all([page.waitForNavigation(), page.goBack()]);
    }

    /**
     * Adds clicked element info to the action results
     * @param {Object} results
     * @returns {Object}
     */
    async updateResults(results) {
        return Object.assign({}, results, {
            message: 'Back to previous page',
        });
    }
}
