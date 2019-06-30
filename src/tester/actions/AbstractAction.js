import { report } from '../messanger';

/**
 * Abstract action class which should be extended
 * with specific action classes.
 * Each class has to have static getter id and method action.
 */
export default class AbstractAction {
	/**
	 * Override with action identifier
	 */
	static get id() {
		throw Error('AbstractAction: Id variable must be overridden with your identifier.');
	}

	/**
	 * Override with method returning true, when the action should be available for the specified element
	 */
	static isActionAvailable() {
		throw Error('AbstractAction: Static method \'isActionAvailable\' must be overridden for specific actions.');
	}

	/**
	 * @param {Object} config
	 * @param {ActionsHelper} actionsHelper
	 * @param {Object} actionConfig
	 */
	constructor(config, actionsHelper, actionConfig = {}) {
		this._config = config;

		this._actionsHelper = actionsHelper;

		this._actionConfig = actionConfig;

		this._listeners = [];

		this._results = {
			action: this.constructor.id,
			errors: [],
			message: `Action: ${this.constructor.id}; Config: ${this.actionConfig}`
		};
	}

	/**
	 * Overridable method returning a promise, that should resolve when action was successfull and reject when not.
	 */
	evaluateAction() {
		return Promise.resolve();
	}

	/**
	 * Override if you need to update action config, or message
	 * @param {Object} results Current results without your updates
	 * @returns {Promise<Object>} Updated results with your overrides
	 */
	updateResults(results) {
		return Promise.resolve(results);
	}

	/**
	 * Prepares action error handler and executes action lifecycle
	 * @param {puppeteer.ElementHandle} element
	 * @param {Object} instance Browser instance
	 * @returns {Object} results
	 */
	async execute(element, instance) {
		this._addEventListener(instance.pageErrorHandler, 'page-error', error => this._addErrorToResults(error));
		this._addEventListener(instance.page, 'response', response => {
			if (this._config.shouldRequestCauseError(response, this._config)) {
				let error = `Requested page "${response.request().url()}" caused an error. [status: ${response.status()}]`

				this._addErrorToResults(error);
			}
		});

		try {
			await this._executeActionLifecycle(element, instance);
		} catch (e) {
			this._handleExecutionError(e);
		}

		this._clearAllEventListeners();

		return this._results;
	}

	/**
	 * Override with specific action method,
	 * which is executed during AbstractAction.execute()
	 */
	action() {
		throw Error('AbstractAction: Method "action" must be overrided!')
	}

	/**
	 * Executes action lifecycle:
	 * - Executes before action scripts (AbstractAction._beforeActionExecute)
	 * - Executes the action and emits 'action:error' event for any error it throws
	 * - Executes after action scripts (AbstractAction._afterActionExecute)
	 * @param {puppeteer.ElementHandle} element
	 * @param {Browser} instance
	 * @param {Function} errorHandler
	 * @param {Function} responseHandler
	 * @returns {Promise} Resolves when lifecycle is finished
	 */
	async _executeActionLifecycle(element, instance) {
		await this._beforeActionExecute(instance);

		try {
			await this.action(element, instance.page, instance.browser);
		} catch (e) {
			this._handleExecutionError(e);
		}

		try {
			await this.evaluateAction(element, instance.page, instance.browser);
		} catch (e) {
			this._addErrorToResults(e.stack);
		}

		await this._afterActionExecute(element, instance);
	}

	/**
	 * Distributes action execution error
	 * @param {Error} error
	 */
	_handleExecutionError({ stack }) {
		this._results.executionError = stack;
		report('action:error', {
			action: this.constructor.id,
			error: stack
		});
	}

	/**
	 * Executes after action scripts
	 * - Executes config.beforeActionScript
	 * - Clears all tabs and windows except for the original one
	 * - If the current url is not part of the tested website, then page.goBack() is called
	 * - Waits for time specified in config.afterActionWaitTime so all scripts are evaluated
	 * and no more errors will occure before next action
	 * - Saves afterLocation to results, which is url after the action was executed
	 * - Reports event 'action:end'
	 * @param {puppeteer.ElementHandle} element
	 * @param {Browser} instance
	 * @returns {Promise} Resolves when after action is done
	 */
	async _afterActionExecute(element, instance) {
		const { browser, page, pageErrorHandler } = instance;

		await page.bringToFront();
		await this._config.afterActionScript(browser, page, pageErrorHandler);
		await this._clearTabs(browser);

		if (!page.url().startsWith(this._config.url)) {
			await page.goBack();
		}

		await page.waitFor(this._config.afterActionWaitTime);

		this._results.afterLocation = page.url();

		await this._logInfo(element);

		report('action:end', {
			action: this.constructor.id,
			results: this._results
		});
	}

	/**
	 * Executes before action scripts
	 * - Saves beforeLocation to results, which is url before the action was executed
	 * - Executes config.beforeActionScript
	 * - Reports event 'action:start'
	 * @param {Browser} instance
	 * @returns {Promise} Resolves when before action is done
	 */
	async _beforeActionExecute(instance) {
		const { browser, page, pageErrorHandler } = instance;

		this._results.beforeLocation = page.url();

		await this._config.beforeActionScript(browser, page, pageErrorHandler);

		report('action:start', {
			action: this.constructor.id
		});
	}

	/**
	 * Adds the error to action results
	 * @param {string} error
	 */
	_addErrorToResults(error) {
		this._results.errors.push({
			type: 'pageError',
			error: error
		});
	}

	/**
	 * Clears all browser tabs except for the tab at index 0
	 * @param {puppeteer.Browser} browser
	 * @returns {Promise} Resolves when the tabs are closed
	 */
	async _clearTabs(browser) {
		let pages = await browser.pages();
		let shiftedPages = pages.slice(1);

		return Promise.all(shiftedPages.map(page => page.close()));
	}

	/**
	 * Adds an event listener and registers it to 
	 * @param {EventListener} target Event listener instance
	 * @param {string} event Name of the event
	 * @param {Function} fn Function evaluated on event call
	 */
	_addEventListener(target, event, fn) {
		target.on(event, fn);

		this._listeners.push({ target, event, fn });
	}

	/**
	 * Clears all registered event listeners
	 */
	_clearAllEventListeners() {
		for (let i = this._listeners.length; i > 0; i--) {
			let { target, event, fn } = this._listeners.pop();

			target.removeListener(event, fn);
		}
	}

	/**
	 * Adds action info to the results
	 * @param {puppeteer.ElementHandle} element
	 * @returns {Promise} Resolves when action info is saved
	 */
	async _logInfo(element) {
		let selector = await this._actionsHelper.getElementSelector(element);
		let html = await this._actionsHelper.getElementHTML(element);

		this._results.config = { selector };
		this._results.html = html;

		this._results = await this.updateResults(this._results, element);
	}
}
