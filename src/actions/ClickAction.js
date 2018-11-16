import AbstractAction from './AbstractAction';
import { getRandomElementFromArray } from '../helpers';

export default class ClickAction extends AbstractAction {
	static get id() {
		return 'click';
	}

	async action(page, browser) {
		const targetCreatedHandler = target => this._closeNewTab(target);
		let element = await this._getElement(page);

		try {
			await this._logClickedElement(element);
		} catch (e) {
			throw Error('Unable to log element information.\n' + e.toString());
		}

		browser.on('targetcreated', targetCreatedHandler);

		try {
			await this._clickOnElement(page, element);
		} catch (e) {
			browser.removeListener('targetcreated', targetCreatedHandler);
			throw e;
		}

		browser.removeListener('targetcreated', targetCreatedHandler);
	}

	async _getElement(page) {
		let element = null;

		if (this._actionConfig && this._actionConfig.selector) {
			element = (await page.$x(this._actionConfig.selector))[0];
		} else {
			element = await this._getRandomElementToClick(page);
		}

		if (!element) {
			throw Error('Unable to initialize an element.');
		}

		return element;
	}

	async _clickOnElement(page, element) {
		await element.hover();

		if (this._config.previewMode) {
			await this._signalClick(element, page);
		}

		await element.click();
	}

	async _signalClick(element, page) {
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
		await page.waitFor(this._config.previewModePauseTime);
	}

	async _logClickedElement(element) {
		let selector = await this._actionsHelper.getElementSelector(element);

		this._results.config = { selector };
		this._results.message = `Click on "${selector}"`;
	}

	_closeNewTab(target) {
		return target.page().then(page => page.close());
	}

	_getRandomElementToClick(page) {
		return this._getDeepestNodes(page)
			.then(nodes => getRandomElementFromArray(nodes));
	}

	async _getDeepestNodes(page) {
		let deepNodes = [];
		let disables = 'not(self::script) and not(self::iframe) and not(self::noscript) and not(self::path)';
		let allElements = await page.$x(`//body//*[${disables} and ancestor::*[${disables}]]`);

		await Promise.all(allElements.map(async element => {
			let executionContext = await element.executionContext();
			let numberOfChildren = await executionContext.evaluate(element => {
				return element && element.childElementCount;
			}, element);

			if (numberOfChildren > 0 || !this._actionsHelper.isElementVisible(element)) {
				return;
			}

			deepNodes.push(element);
		}));

		return deepNodes;
	}
}
