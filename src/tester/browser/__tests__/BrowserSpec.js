jest.mock('../../messanger');

import Browser from '../Browser';
import * as messanger from '../../messanger';

describe('Browser', () => {
	let browser = null;

	beforeEach(() => {
		browser = new Browser({});
	});

	it('can be initialized', () => {
		expect(browser._config).toEqual({});
		expect(browser._browser).toEqual(null);
		expect(browser._page).toEqual(null);
		expect(browser._pageErrorHandler).toEqual(null);
	});

	it('can init browser instance', async () => {
		let page = {
			setDefaultNavigationTimeout: jest.fn()
				.mockReturnValue(Promise.resolve())
		};
		let browserInstance = {
			pages: jest.fn().mockReturnValue(Promise.resolve([page]))
		};
		browser._getBrowser = jest.fn()
			.mockReturnValue(Promise.resolve(browserInstance));
		browser._initPageErrorHandler = jest.fn()
			.mockReturnValue(Promise.resolve());
		browser._initFatalErrorHandler = jest.fn();
		let defaultNavigationTimeout = 30000;
		browser._config = { defaultNavigationTimeout };

		await browser.initBrowser();

		expect(browser._browser).toEqual(browserInstance);
		expect(browser._page).toEqual(page);
		expect(browser._getBrowser).toHaveBeenCalledTimes(1);
		expect(browserInstance.pages).toHaveBeenCalledTimes(1);
		expect(browser._initFatalErrorHandler).toHaveBeenCalledTimes(1);
		expect(browser._initPageErrorHandler).toHaveBeenCalledTimes(1);
		expect(page.setDefaultNavigationTimeout)
			.toHaveBeenCalledWith(defaultNavigationTimeout);
	});

	it('can clear browser instance', async () => {
		browser._pageErrorHandler = () => {};
		let browserInstance = {
			close: jest.fn().mockReturnValue(Promise.resolve())
		};
		browser._browser = browserInstance;

		await browser.clear();

		expect(browser._pageErrorHandler).not.toBeDefined();
		expect(browserInstance.close).toHaveBeenCalledTimes(1);
	});

	it('can initialize fatal error handler', () => {
		messanger.report = jest.fn();
		browser._page = {
			on: jest.fn((_, fn) => {
				fn({ stack: 'error' })
			})
		};
		browser.clear = jest.fn();

		browser._initFatalErrorHandler();

		expect(browser._page.on)
			.toHaveBeenCalledWith('error', jasmine.any(Function));
		expect(messanger.report)
			.toHaveBeenCalledWith('browser:error', {
				error: jasmine.any(String)
			});
		expect(browser.clear).toHaveBeenCalled();
	});

	it('can initialize page error handler', async () => {
		let eventEmitter = {};
		browser._getEventEmitter = jest.fn().mockReturnValue(eventEmitter);
		let page = {
			exposeFunction: jest.fn().mockReturnValue(Promise.resolve()),
			evaluateOnNewDocument: jest.fn()
				.mockReturnValue(Promise.resolve())
		};
		browser._page = page;
		let pageErrorHandler = {};
		browser._config = { pageErrorHandler };

		await browser._initPageErrorHandler();

		expect(browser._pageErrorHandler).toEqual(eventEmitter);
		expect(page.exposeFunction)
			.toHaveBeenCalledWith('qapeError', jasmine.any(Function));
		expect(page.evaluateOnNewDocument)
			.toHaveBeenCalledWith(pageErrorHandler);
	});
});
