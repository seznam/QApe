import puppeteer from 'puppeteer';
import EventEmitter from 'events';

export default class Browser {
	constructor(config) {
		this._config = config;

		this._browser = null;

		this._page = null;

		this._pageErrorHandler = null;

		this._defaultPageErrorHandler = null;
	}

	get browser() {
		return this._browser;
	}

	get page() {
		return this._page;
	}

	get pageErrorHandler() {
		return this._pageErrorHandler;
	}

	async initBrowser() {
		this._browser = await this._getBrowser();
		this._page = (await this._browser.pages())[0];
		await this._initPageErrorHandler();

		await this._page.setDefaultNavigationTimeout(this._config.defaultNavigationTimeout);

		return this;
	}

	async clear() {
		delete this._pageErrorHandler;

		await this._browser.close();
	}

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

	async _initPageErrorHandler() {
		this._pageErrorHandler = this._getEventEmitter();
		this._defaultPageErrorHandler = error => this._pageErrorHandler.emit('page-error', error);

		await this._page.exposeFunction('opicakError', (error) => this._pageErrorHandler.emit('page-error', error));
		await this._page.evaluateOnNewDocument(this._config.pageErrorHandler);
	}

	_getEventEmitter() {
		return new EventEmitter();
	}
}
