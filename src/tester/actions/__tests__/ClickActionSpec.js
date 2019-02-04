import ClickAction from '../ClickAction';

describe('ClickAction', () => {
	let clickAction = null;

	beforeEach(() => {
		clickAction = new ClickAction({}, {});
	});

	it('can be initialized', () => {
		expect(clickAction._config).toEqual({});
	});

	it('can perform the click action', async () => {
		let element = {};
		clickAction._getElement = jest.fn()
			.mockReturnValue(Promise.resolve(element));
		clickAction._logClickedElement = jest.fn()
			.mockReturnValue(Promise.resolve());
		clickAction._clickOnElement = jest.fn()
			.mockReturnValue(Promise.resolve());
		let eventListeners = [];
		let browser = {
			on: jest.fn((name, method) => eventListeners.push({ name, method })),
			removeListener: jest.fn()
		};
		let page = {};

		await clickAction.action(page, browser);

		eventListeners.forEach(({ name, method }) => {
			expect(browser.on).toHaveBeenCalledWith(name, method);
			expect(browser.removeListener).toHaveBeenCalledWith(name, method);
		});
		expect(clickAction._getElement).toHaveBeenCalledWith(page);
		expect(clickAction._logClickedElement).toHaveBeenCalledWith(element);
		expect(clickAction._clickOnElement).toHaveBeenCalledWith(page, element);
	});

	it('can get random element', async () => {
		let element = {};
		let page = {};
		clickAction._actionsHelper.getRandomPageElement = jest.fn()
			.mockReturnValue(Promise.resolve(element));

		let recievedElement = await clickAction._getElement(page);

		expect(recievedElement).toEqual(element);
		expect(clickAction._actionsHelper.getRandomPageElement)
			.toHaveBeenCalledWith(page);
	});

	it('can get specific element', async () => {
		let element = {};
		let page = {
			$x: jest.fn().mockReturnValue(Promise.resolve([element]))
		};
		let selector = 'selector';
		clickAction._actionConfig = { selector };

		let recievedElement = await clickAction._getElement(page);

		expect(recievedElement).toEqual(element);
		expect(page.$x).toHaveBeenCalledWith(selector);
	});

	it('can click on a specified element', async () => {
		let page = {};
		let element = {
			hover: jest.fn().mockReturnValue(Promise.resolve()),
			click: jest.fn().mockReturnValue(Promise.resolve())
		};

		await clickAction._clickOnElement(page, element);

		expect(element.hover).toHaveBeenCalledTimes(1);
		expect(element.click).toHaveBeenCalledTimes(1);
	});

	it('can click on a specified element in preview mode', async () => {
		let page = {
			waitFor: jest.fn()
		};
		let element = {
			hover: jest.fn().mockReturnValue(Promise.resolve()),
			click: jest.fn().mockReturnValue(Promise.resolve())
		};
		clickAction._config = {
			headlessModeDisabled: true,
			previewModePauseTime: 99
		};
		clickAction._actionsHelper.highlightElement = jest.fn()
			.mockReturnValue(Promise.resolve());

		await clickAction._clickOnElement(page, element);

		expect(element.hover).toHaveBeenCalledTimes(1);
		expect(clickAction._actionsHelper.highlightElement)
			.toHaveBeenCalledWith(element);
		expect(page.waitFor).toHaveBeenCalledWith(99);
		expect(element.click).toHaveBeenCalledTimes(1);
	});

	it('can log clicked element', async () => {
		let element = {};
		let actionsHelper = {
			getElementSelector: jest.fn().mockReturnValue('selector'),
			getElementHTML: jest.fn().mockReturnValue('html')
		};
		clickAction._actionsHelper = actionsHelper;

		await clickAction._logClickedElement(element);

		expect(clickAction._results.config.selector).toEqual('selector');
		expect(clickAction._results.html).toEqual('html');
		expect(actionsHelper.getElementSelector).toHaveBeenCalledWith(element);
		expect(actionsHelper.getElementHTML).toHaveBeenCalledWith(element);
	});
});
