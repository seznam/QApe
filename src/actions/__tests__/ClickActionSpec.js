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
		clickAction._getRandomElementToClick = jest.fn()
			.mockReturnValue(Promise.resolve(element));

		let recievedElement = await clickAction._getElement(page);

		expect(recievedElement).toEqual(element);
		expect(clickAction._getRandomElementToClick)
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
		let page = {};
		let element = {
			hover: jest.fn().mockReturnValue(Promise.resolve()),
			click: jest.fn().mockReturnValue(Promise.resolve())
		};
		clickAction._config = { previewMode: true };
		clickAction._signalClick = jest.fn()
			.mockReturnValue(Promise.resolve());

		await clickAction._clickOnElement(page, element);

		expect(element.hover).toHaveBeenCalledTimes(1);
		expect(clickAction._signalClick)
			.toHaveBeenCalledWith(element, page);
		expect(element.click).toHaveBeenCalledTimes(1);
	});

	it('can signal clicked element (in preview mode)', async () => {
		let executionContext = {
			evaluate: jest.fn().mockReturnValue(Promise.resolve())
		};
		let element = {
			executionContext: jest.fn()
				.mockReturnValue(Promise.resolve(executionContext))
		};
		let page = {
			waitFor: jest.fn().mockReturnValue(Promise.resolve())
		};
		let previewModePauseTime = 500;
		clickAction._config = { previewModePauseTime };

		await clickAction._signalClick(element, page);

		expect(element.executionContext).toHaveBeenCalledTimes(1);
		expect(executionContext.evaluate).toHaveBeenCalledWith(
			jasmine.any(Function),
			element,
			previewModePauseTime - 250
		);
		expect(page.waitFor).toHaveBeenCalledWith(previewModePauseTime);
	});

	it('can log clicked element', async () => {
		let element = {};
		let selector = 'selector';
		let actionsHelper = {
			getElementSelector: jest.fn().mockReturnValue(selector)
		};
		clickAction._actionsHelper = actionsHelper;

		await clickAction._logClickedElement(element);

		expect(clickAction._results.config.selector).toEqual(selector);
		expect(actionsHelper.getElementSelector).toHaveBeenCalledWith(element);
	});

	it('can close newly created tab', async () => {
		let page = {
			close: jest.fn().mockReturnValue(Promise.resolve())
		};
		let target = {
			page: jest.fn().mockReturnValue(Promise.resolve(page))
		};

		await clickAction._closeNewTab(target);

		expect(target.page).toHaveBeenCalledTimes(1);
		expect(page.close).toHaveBeenCalledTimes(1);
	});

	it('can get random element to click', async () => {
		let page = {};
		let nodes = ['node1', 'node2', 'node3'];
		clickAction._getDeepestNodes = jest.fn()
			.mockReturnValue(Promise.resolve(nodes));

		let element = await clickAction._getRandomElementToClick(page);

		expect(clickAction._getDeepestNodes).toHaveBeenCalledWith(page);
		expect(nodes.includes(element)).toBeTruthy();
	});

	it('can get deepest nodes in the DOM tree', async () => {
		let executionContext = {
			evaluate: jest.fn().mockReturnValue(Promise.resolve(0))
		};
		let element = {
			executionContext: jest.fn()
				.mockReturnValue(Promise.resolve(executionContext))
		};
		let page = {
			$x: jest.fn().mockReturnValue(Promise.resolve([element]))
		};
		let actionsHelper = {
			isElementVisible: jest.fn().mockReturnValue(true)
		};
		clickAction._actionsHelper = actionsHelper;

		let deepestNodes = await clickAction._getDeepestNodes(page);

		expect(deepestNodes).toEqual([element]);
		expect(element.executionContext).toHaveBeenCalledTimes(1);
		expect(executionContext.evaluate)
			.toHaveBeenCalledWith(jasmine.any(Function), element);
		expect(actionsHelper.isElementVisible).toHaveBeenCalledWith(element);
	});
});
