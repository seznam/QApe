/**
 * Useful helpers that can be used by any action
 */
export default class ActionsHelper {
    /**
     * @param {Object} config
     */
    constructor(config) {
        this._config = config;
    }

    /**
     * Resolves when page readyState equals to one of specified states.
     * If the state does not equal after specified timeout, it throw error.
     * @param {puppeteer.Page} page
     * @param {Object} [options]
     * @param {number} [options.timeout=30000]
     * @param {string[]} [options.states=[interactive,complete]] document.readyState values
     * @param {number} [options.checkInterval=50]
     */
    async waitForReadyState(page, options) {
        let start = Date.now();
        let state;
        options = options || {
            timeout: 30000,
            states: ['interactive', 'complete'],
            checkInterval: 50,
        };

        while (Date.now() - start <= options.timeout) {
            state = await page.evaluate(() => document.readyState);

            if (options.states.includes(state)) {
                return;
            }

            await page.waitFor(options.checkInterval);
        }

        throw Error(`Expected ready state to be one of ${options.states.join(', ')}, but it was ${state}`);
    }

    /**
     * Searches for all visible elements in DOM
     * @param {puppeteer.Page} page
     * @returns {Promise<puppeteer.ElementHandle[]>} Array of elements
     */
    async getAllVisiblePageElements(page) {
        let visibleElements = [];
        let allElements = await page.$x(this._config.elementSelector);

        await Promise.all(
            allElements.map(async element => {
                let executionContext = await element.executionContext();
                let numberOfChildren = await executionContext.evaluate(element => {
                    return element && element.childElementCount;
                }, element);

                if (numberOfChildren > 0 || !this.isElementVisible(element)) {
                    return;
                }

                visibleElements.push(element);
            })
        );

        return visibleElements;
    }

    /**
     * Searches for an element based on action configuration
     * @param {puppeteer.Page} page
     * @param {Object} [actionConfig={}]
     * @returns {Promise<puppeteer.ElementHandle>} element
     */
    async getElement(page, actionConfig = {}) {
        let element = (await page.$x(actionConfig.selector))[0];

        if (!element) {
            let config = JSON.stringify(actionConfig, null, 2);

            throw Error('Unable to initialize an element with following config.\n' + config);
        }

        return element;
    }

    /**
     * Creates a selector for the element
     * @param {puppeteer.ElementHandle} element
     * @returns {Promise<string>} selector
     */
    async getElementSelector(element) {
        let executionContext = await element.executionContext();

        return executionContext.evaluate(this._config.getElementSelector, element);
    }

    /**
     * Highlights the element in the dom by adding some styles
     * @param {puppeteer.ElementHandle} element
     * @returns {Promise} Resolves when element highlight is started
     */
    async highlightElement(element) {
        let executionContext = await element.executionContext();

        await executionContext.evaluate(
            (element, timeout) => {
                let originalColor = element.style['color'];
                let originalBorder = element.style['border'];
                element.style['color'] = 'red';
                element.style['border'] = 'solid';

                setTimeout(() => {
                    element.style['color'] = originalColor;
                    element.style['border'] = originalBorder;
                }, timeout);
            },
            element,
            this._config.previewModePauseTime - 250
        );
    }

    /**
     * @param {puppeteer.ElementHandle} element
     * @returns {Promise<string>} element.outerHTML
     */
    async getElementHTML(element) {
        let executionContext = await element.executionContext();

        return executionContext.evaluate(element => element.outerHTML, element);
    }

    /**
     * Checks if an element is visible
     * @param {puppeteer.ElementHandle} element
     * @returns {Promise<boolean>} true if an element is visible
     */
    async isElementVisible(element) {
        return !!(await element.boundingBox());
    }
}
