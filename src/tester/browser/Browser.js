import puppeteer from 'puppeteer';
import EventEmitter from 'events';
import { report } from '../messanger';

/**
 * Browser instance
 */
export default class Browser {
	/**
	 * @param {Object} config
	 */
	constructor(config) {
		this._config = config;

		this._browser = null;

		this._page = null;

		this._pageErrorHandler = null;
	}

	/**
	 * @returns {puppeteer.Browser}
	 */
	get browser() {
		return this._browser;
	}

	/**
	 * @returns {puppeteer.Page}
	 */
	get page() {
		return this._page;
	}

	/**
	 * Page error handler recieves 'page-error' event
	 * whenever an error occures on the page.
	 * Action should add listener to this handler and
	 * listen to the 'page-error' event to see if the action
	 * caused an error on the page.
	 * @returns {Function}
	 */
	get pageErrorHandler() {
		return this._pageErrorHandler;
	}

	/**
	 * Initializes browser instance
	 * @returns {Promise<Browser>}
	 */
	async initBrowser() {
		this._browser = await this._getBrowser();
		this._page = (await this._browser.pages())[0];

		this._initFatalErrorHandler();
		await this._initPageErrorHandler();
		await this._page.setDefaultNavigationTimeout(this._config.defaultNavigationTimeout);

		return this;
	}

	/**
	 * Clears browser instance
	 * @returns {Promise} Resolves when the instance is cleared
	 */
	async clear() {
		delete this._pageErrorHandler;

		await this._browser.close();
	}

	/**
	 * Gets browser instance from puppeteer.
	 * If there is a config.browserWebSocketEndpoint set,
	 * it will connect to remote chrome instance,
	 * otherwise it will create new instance locally
	 * @returns {Promise<puppeteer.Browser>}
	 */
	_getBrowser() {
		if (this._config.browserWebSocketEndpoint) {
			return puppeteer
				.connect(
					Object.assign(
						this._config.defaultBrowserSettings,
						{ browserWSEndpoint: this._config.browserWebSocketEndpoint }
					)
				);
		}

		return puppeteer
			.launch(
				Object.assign(
					this._config.defaultBrowserSettings,
					{ headless: !this._config.headlessModeDisabled }
				)
			);
	}

	/**
	 * Whenever a page error occures, there is a strong possibility,
	 * that QApe tester is in inconsistent state.
	 * So it will try to clear the instance and wait for the new
	 * test run.
	 */
	_initFatalErrorHandler() {
		this._page.on('error', error => {
			let msg = error.stack + '\n' +
				'Because of the error above the browser instance ' +
				'has been cleared and may cause an additional error ' +
				'in current test run. You can ignore it, since QApe ' +
				'tester should recover by itself.';

			report('browser:error', { error: msg });
			this.clear();
		});
	}

	/**
	 * Initializes pageErrorHandler, exposes it to the
	 * page instance and loads config.pageErrorHandler
	 * @returns {Promise} Resolves when handler is initialized
	 */
	async _initPageErrorHandler() {
		this._pageErrorHandler = this._getEventEmitter();

		await this._page.exposeFunction('qapeError', error => this._pageErrorHandler.emit('page-error', error));
		await this._page.evaluateOnNewDocument(this._config.pageErrorHandler);
	}

	/**
	 * @returns {EventEmitter}
	 */
	_getEventEmitter() {
		return new EventEmitter();
	}
}
