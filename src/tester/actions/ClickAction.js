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
	 * @returns {Boolean} true
	 */
	static isActionAvailable() {
		return true;
	}

	/**
	 * Finds specified, or random element
	 * Generates action config for action re-run
	 * Performs click on the element
	 * @param {puppeteer.ElementHandle} element
	 * @param {puppeteer.Page} page
	 * @returns {Promise} Resolves when click is done
	 */
	async action(element, page) {
		try {
			await this._logInfo(element);
		} catch (e) {
			throw Error('Unable to log element information.\n' + e.stack);
		}

		await this._clickOnElement(page, element);
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
	async _logInfo(element) {
		let selector = await this._actionsHelper.getElementSelector(element);
		let html = await this._actionsHelper.getElementHTML(element);

		this._results.config = { selector };
		this._results.html = html;
		this._results.message = `Click on ${html} [selector:"${selector}"]`;
	}
}
