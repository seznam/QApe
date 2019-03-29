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
	 * @returns {Boolean}
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
	 * Generates random or uses specified text
	 * Generates action config for action re-run
	 * Types the generated text into the element
	 * @param {puppeteer.ElementHandle} element
	 * @param {puppeteer.Page} page
	 * @returns {Promise} Resolves when typing is done
	 */
	async action(element, page) {
		let text = this._getText();

		try {
			await this._logInfo(element, text);
		} catch (e) {
			throw Error('Unable to log element information.\n' + e.stack);
		}

		await this._typeIntoElement(page, element, text);
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
	 * Performs the type action with following wrappers:
	 * - Hover over the element
	 * (So that in preview mode, you will see the element before typing)
	 * - Highlight the element (Only in headfull mode)
	 * - Type the specified text into the element
	 * @param {puppeteer.Page} page
	 * @param {puppeteer.ElementHandle} element
	 * @returns {Promise} Resolves when typing is done
	 */
	async _typeIntoElement(page, element, text) {
		await element.hover();

		if (this._config.headlessModeDisabled) {
			await this._actionsHelper.highlightElement(element);
			await page.waitFor(this._config.previewModePauseTime);
		}

		await element.type(text, { delay: this._config.typeActionDelay });
	}

	/**
	 * Adds clicked element info to the action results
	 * @returns {Promise} Resolves when action info is saved
	 */
	async _logInfo(element, text) {
		let selector = await this._actionsHelper.getElementSelector(element);
		let html = await this._actionsHelper.getElementHTML(element);

		this._results.config = { selector, text };
		this._results.html = html;
		this._results.message = `Type '${text}' into ${html} [selector:"${selector}"]`;
	}
}