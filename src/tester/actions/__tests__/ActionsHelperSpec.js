import ActionsHelper from '../ActionsHelper';

describe('ActionsHelper', () => {
	let actionsHelper = null;

	beforeEach(() => {
		actionsHelper = new ActionsHelper({});
	});

	it('can be initialized', () => {
		expect(actionsHelper._config).toEqual({});
	});

	it('can wait for ready state', async () => {
		let page = {
			evaluate: jest.fn()
				.mockReturnValueOnce(Promise.resolve('loading'))
				.mockReturnValue(Promise.resolve('interactive')),
			waitFor: jest.fn()
				.mockReturnValue(Promise.resolve())
		};
		
		await actionsHelper.waitForReadyState(page);

		expect(page.evaluate)
			.toHaveBeenCalledTimes(2);
		expect(page.evaluate)
			.toHaveBeenCalledWith(jasmine.any(Function));
		expect(page.waitFor)
			.toHaveBeenCalledTimes(1);
		expect(page.waitFor)
			.toHaveBeenCalledWith(jasmine.any(Number));
	});

	it('can get all visible elements in DOM', async () => {
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
		actionsHelper.isElementVisible = jest.fn().mockReturnValue(true);

		let visibleElements = await actionsHelper.getAllVisiblePageElements(page);

		expect(visibleElements).toEqual([element]);
		expect(element.executionContext).toHaveBeenCalledTimes(1);
		expect(executionContext.evaluate)
			.toHaveBeenCalledWith(jasmine.any(Function), element);
		expect(actionsHelper.isElementVisible).toHaveBeenCalledWith(element);
	});

	it('can get an element from actionConfig', async () => {
		let element = 'element';
		let page = {
			$x: jest.fn()
				.mockReturnValue(Promise.resolve([element]))
		};
		let actionConfig = { selector: 'selector' };

		let results = await actionsHelper.getElement(page, actionConfig);

		expect(results).toEqual(element);
		expect(page.$x).toHaveBeenCalledWith(actionConfig.selector);
	});

	it('can highlight an element', async () => {
		let executionContext = {
			evaluate: jest.fn().mockReturnValue(Promise.resolve())
		};
		let element = {
			executionContext: jest.fn()
				.mockReturnValue(Promise.resolve(executionContext))
		};
		let previewModePauseTime = 500;
		actionsHelper._config = { previewModePauseTime };

		await actionsHelper.highlightElement(element);

		expect(element.executionContext).toHaveBeenCalledTimes(1);
		expect(executionContext.evaluate).toHaveBeenCalledWith(
			jasmine.any(Function),
			element,
			previewModePauseTime - 250
		);
	});

	it('can get element html', async () => {
		let context = {
			evaluate: jest.fn((fn, el) => fn(el))
		};
		let element = {
			executionContext: jest.fn().mockReturnValue(Promise.resolve(context)),
			outerHTML: 'html'
		};

		let html = await actionsHelper.getElementHTML(element);

		expect(html).toEqual('html');
		expect(element.executionContext).toHaveBeenCalledTimes(1);
		expect(context.evaluate).toHaveBeenCalledWith(jasmine.any(Function), element);
	});

	it('can check if an element is visible', async () => {
		let element = {
			boundingBox: jest.fn()
				.mockReturnValue(Promise.resolve({ x: 1, y: 2 }))
		};

		let isVisible = await actionsHelper.isElementVisible(element);

		expect(isVisible).toBe(true);
		expect(element.boundingBox).toHaveBeenCalled();
	});
});
