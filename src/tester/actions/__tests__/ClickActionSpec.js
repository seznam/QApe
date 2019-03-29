import ClickAction from '../ClickAction';

describe('ClickAction', () => {
	let clickAction = null;

	beforeEach(() => {
		clickAction = new ClickAction({}, {});
	});

	it('can be initialized', () => {
		expect(clickAction._config).toEqual({});
	});

	it('can check if a click action is available', () => {
		expect(ClickAction.isActionAvailable()).toEqual(true);
	});

	it('can perform the click action', async () => {
		let element = 'element';
		let page = 'page';
		clickAction._logInfo = jest.fn()
			.mockReturnValue(Promise.resolve());
		clickAction._clickOnElement = jest.fn()
			.mockReturnValue(Promise.resolve());

		await clickAction.action(element, page);

		expect(clickAction._logInfo).toHaveBeenCalledWith(element);
		expect(clickAction._clickOnElement).toHaveBeenCalledWith(page, element);
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

	it('can log element info', async () => {
		let element = {};
		let actionsHelper = {
			getElementSelector: jest.fn().mockReturnValue('selector'),
			getElementHTML: jest.fn().mockReturnValue('html')
		};
		clickAction._actionsHelper = actionsHelper;

		await clickAction._logInfo(element);

		expect(clickAction._results.config.selector).toEqual('selector');
		expect(clickAction._results.html).toEqual('html');
		expect(actionsHelper.getElementSelector).toHaveBeenCalledWith(element);
		expect(actionsHelper.getElementHTML).toHaveBeenCalledWith(element);
	});
});
