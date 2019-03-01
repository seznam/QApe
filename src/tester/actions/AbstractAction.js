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
		throw Error('AbstractAction: Id variable must be overwritten with your identifier.');
	}

	/**
	 * @param {Object} config
	 * @param {ActionsHelper} actionsHelper
	 */
	constructor(config, actionsHelper) {
		this._config = config;

		this._actionsHelper = actionsHelper;

		this._actionConfig = {};

		this._results = {
			action: this.constructor.id,
			errors: [],
			message: `Action: ${this.constructor.id}; Config: ${this.actionConfig}`
		};
	}

	/**
	 * Prepares action error handler and executes action lifecycle
	 * @param {Object} instance Browser instance
	 * @returns {Object} results
	 */
	async execute(instance) {
		const errorHandler = (error) => this._addErrorToResults(error);
		const responseHandler = (response) => {
			if (this._config.shouldRequestCauseError(response, this._config)) {
				let message = `Requested page "${response.request().url()}" caused an error. [status: ${response.status()}]`;

				this._addErrorToResults(message);
			}
		}

		try {
			await this._executeActionLifecycle(instance, errorHandler, responseHandler);
		} catch (e) {
			this._handleExecutionError(instance, e);
		}

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
	 * Sets configuration for the action
	 * @param {Object} config Action config
	 */
	setActionConfig(config) {
		this._actionConfig = config;
	}

	/**
	 * @returns {Object} Action configuration
	 */
	getActionConfig() {
		return this._actionConfig;
	}

	/**
	 * Executes action lifecycle:
	 * - Executes before action scripts (AbstractAction._beforeActionExecute)
	 * - Executes the action and emits 'action:error' event for any error it throws
	 * - Executes after action scripts (AbstractAction._afterActionExecute)
	 * @param {Browser} instance
	 * @param {Function} errorHandler
	 * @param {Function} responseHandler
	 * @returns {Promise} Resolves when lifecycle is finished
	 */
	async _executeActionLifecycle(instance, errorHandler, responseHandler) {
		this._beforeActionExecute(instance, errorHandler, responseHandler);

		try {
			await this.action(instance.page, instance.browser);
		} catch (e) {
			this._handleExecutionError(instance, e);
		}

		await this._afterActionExecute(instance, errorHandler, responseHandler);
	}

	/**
	 * Distributes action execution error
	 * @param {Browser} instance
	 * @param {Error} error
	 */
	_handleExecutionError(instance, { stack }) {
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
	 * - Removes page error handler
	 * - Removes response handler
	 * - Saves afterLocation to results, which is url after the action was executed
	 * - Reports event 'action:end'
	 * @param {Browser} instance
	 * @param {Function} errorHandler
	 * @param {Function} responseHandler
	 * @returns {Promise} Resolves when after action is done
	 */
	async _afterActionExecute(instance, errorHandler, responseHandler) {
		const { browser, page, pageErrorHandler } = instance;

		await page.bringToFront();

		this._config.afterActionScript(browser, page, pageErrorHandler);

		await this._clearTabs(browser);

		if (!page.url().startsWith(this._config.url)) {
			await page.goBack();
		}

		await page.waitFor(this._config.afterActionWaitTime);

		pageErrorHandler.removeListener('page-error', errorHandler);
		page.removeListener('response', responseHandler);

		this._results.afterLocation = page.url();

		report('action:end', {
			action: this.constructor.id,
			results: this._results
		});
	}

	/**
	 * Executes before action scripts
	 * - Saves beforeLocation to results, which is url before the action was executed
	 * - Adds page error handler to identify errors caused by this action
	 * - Add response handler to identify invalid responses to page requests
	 * - Executes config.beforeActionScript
	 * - Reports event 'action:start'
	 * @param {Browser} instance
	 * @param {Function} errorHandler
	 * @param {Function} responseHandler
	 * @returns {Promise} Resolves when before action is done
	 */
	_beforeActionExecute(instance, errorHandler, responseHandler) {
		const { browser, page, pageErrorHandler } = instance;

		this._results.beforeLocation = page.url();

		pageErrorHandler.on('page-error', errorHandler);
		page.on('response', responseHandler);

		this._config.beforeActionScript(browser, page, pageErrorHandler);

		report('action:start', {
			action: this.constructor.id
		});
	}

	/**
	 * Adds the error to action results
	 * @param {Error} error
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
	_clearTabs(browser) {
		return browser.pages()
			.then(pages => {
				let shiftedPages = pages.slice(1);

				return Promise.all(shiftedPages.map(page => page.close()));
			});
	}
}
