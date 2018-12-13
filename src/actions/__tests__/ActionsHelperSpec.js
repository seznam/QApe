import ActionsHelper from '../ActionsHelper';

describe('ActionsHelper', () => {
	let actionsHelper = null;

	beforeEach(() => {
		actionsHelper = new ActionsHelper({});
	});

	it('can be initialized', () => {
		expect(actionsHelper._config).toEqual({});
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

	it('can get random element from page', async () => {
		let page = {};
		let nodes = ['node1', 'node2', 'node3'];
		actionsHelper.getAllVisiblePageElements = jest.fn()
			.mockReturnValue(Promise.resolve(nodes));

		let element = await actionsHelper.getRandomPageElement(page);

		expect(actionsHelper.getAllVisiblePageElements)
			.toHaveBeenCalledWith(page);
		expect(nodes.includes(element)).toBeTruthy();
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
});
