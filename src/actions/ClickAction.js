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
	 * Finds specified, or random element
	 * Generates action config for action re-run
	 * Performs click on the element
	 * @param {puppeteer.Page} page
	 * @param {puppeteer.Browser} browser
	 * @returns {Promise} Resolves when click is done
	 */
	async action(page, browser) {
		let element = await this._getElement(page);

		try {
			await this._logClickedElement(element);
		} catch (e) {
			throw Error('Unable to log element information.\n' + e.toString());
		}

		await this._clickOnElement(page, element);
	}

	/**
	 * Searches for an element based on action configuration,
	 * or selects random clickable element.
	 * @param {puppeteer.Page} page
	 * @returns {Promise<puppeteer.ElementHandle>} element
	 */
	async _getElement(page) {
		let element = null;

		if (this._actionConfig && this._actionConfig.selector) {
			element = (await page.$x(this._actionConfig.selector))[0];
		} else {
			element = await this._actionsHelper.getRandomPageElement(page);
		}

		if (!element) {
			throw Error('Unable to initialize an element.');
		}

		return element;
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
	async _clickOnElement(page, element) {
		await element.hover();

		if (this._config.headlessModeDisabled) {
			await this._actionsHelper.highlightElement(element);
			await page.waitFor(this._config.previewModePauseTime);
		}

		await element.click();
	}

	/**
	 * Adds clicked element info to the action results
	 * @returns {Promise} Resolves when action info is saved
	 */
	async _logClickedElement(element) {
		let selector = await this._actionsHelper.getElementSelector(element);

		this._results.config = { selector };
		this._results.message = `Click on "${selector}"`;
	}
}
