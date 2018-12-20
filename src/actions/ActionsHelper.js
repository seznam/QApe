import { getRandomElementFromArray } from '../helpers';

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
	 * Creates a selector for the element
	 * @param {puppeteer.ElementHandle} element
	 * @returns {Promise<string>} selector
	 */
	async getElementSelector(element) {
		let executionContext = await element.executionContext();

		return executionContext.evaluate(this._config.getElementSelector, element);
	}

	/**
	 * Checks if an element is visible
	 * @param {puppeteer.ElementHandle} element
	 * @returns {Promise<boolean>} true if an element is visible
	 */
	async isElementVisible(element) {
		return !!(await element.boundingBox());
	}

	/**
	 * Highlights the element in the dom by adding some styles
	 * @param {puppeteer.ElementHandle} element
	 * @returns {Promise} Resolves when element highlight is started
	 */
	async highlightElement(element) {
		let executionContext = await element.executionContext();

		await executionContext.evaluate((element, timeout) => {
			let originalColor = element.style['color'];
			let originalBorder = element.style['border'];
			element.style['color'] = 'red';
			element.style['border'] = 'solid';

			setTimeout(() => {
				element.style['color'] = originalColor;
				element.style['border'] = originalBorder;
			}, timeout);
		}, element, this._config.previewModePauseTime - 250);
	}

	/**
	 * Searches for random visible element in DOM
	 * @param {puppeteer.Page} page
	 * @returns {Promise<puppeteer.ElementHandle>} element
	 */
	getRandomPageElement(page) {
		return this.getAllVisiblePageElements(page)
			.then(nodes => getRandomElementFromArray(nodes));
	}

	/**
	 * Searches for all visible elements in DOM
	 * @param {puppeteer.Page} page
	 * @returns {Promise<puppeteer.ElementHandle[]>} Array of elements
	 */
	async getAllVisiblePageElements(page) {
		let visibleElements = [];
		let disables = 'not(self::script) and not(self::noscript) and not(self::path)';
		let allElements = await page.$x(`//body//*[${disables} and ancestor::*[${disables}]]`);

		await Promise.all(allElements.map(async element => {
			let executionContext = await element.executionContext();
			let numberOfChildren = await executionContext.evaluate(element => {
				return element && element.childElementCount;
			}, element);

			if (numberOfChildren > 0 || !this.isElementVisible(element)) {
				return;
			}

			visibleElements.push(element);
		}));

		return visibleElements;
	}
}
