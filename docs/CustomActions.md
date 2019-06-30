# Custom Actions
You can implement your own custom actions that are more specific to your website. Action does not necessarily has to be a single user interaction, but it can be any subset of the test scenario. You can fillout whole forms, navigate through multiple pages, or login as a specific user. Thanks to several lifecycle methods, you can specify circumstances when this action can be performed, what should it do and what is the expected result. 

```javascript
const { AbstractAction } = require('qape').default;

class CustomAction extends AbstractAction {
	/**
	 * Unique ID for you action must be specified
	 * @returns {string}
	 */
	static get id() {
		return 'custom';
	}

	/**
	 * You need to specify, if the action should be available
	 * for the specified element in the current page state.
	 * Note that this should not take too long, since it can
	 * have a great impact on QApe performance.
	 * @param {puppeteer.ElementHandle} element
	 * @param {puppeteer.Page} page
	 * @returns {boolean}
	 */
	static async isActionAvailable(element, page) {
		return !!(await page.$('#custom-page'));
	}

	/**
	 * Perform the action
	 * @param {puppeteer.ElementHandle} element
	 * @param {puppeteer.Page} page
	 * @param {puppeteer.Browser} browser
	 * @returns {Promise}
	 */
	async action(element, page, browser) {
		await element.click();
		await element.type('Hello!');
		await page.keyboard.press('Enter');
	}

	/**
	 * You can update results info
	 * @returns {Promise<Object>|Object}
	 */
	async updateResults(results) {
		return Object.assign(
			{},
			results,
			{ message: `Performed custom action on element ${results.html} with selector "${results.config.selector}"` }
		);
	}
}

module.exports = {
	default: CustomAction
};
```
