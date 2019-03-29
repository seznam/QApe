import TypeAction from '../TypeAction';

describe('TypeAction', () => {
	let typeAction = null;

	beforeEach(() => {
		typeAction = new TypeAction({}, {});
	});

	it('can be initialized', () => {
		expect(typeAction._config).toEqual({});
	});

	it('can check if a type action is available', () => {
		let context = {
			evaluate: jest.fn(fn => fn(element))
		};
		let executionContext = jest.fn().mockReturnValue(context);
		let element = {
			executionContext,
			matches: jest.fn().mockReturnValue(true)
		};

		expect(TypeAction.isActionAvailable(element))
			.toEqual(true);
		expect(element.executionContext)
			.toHaveBeenCalledTimes(1);
		expect(context.evaluate)
			.toHaveBeenCalledWith(jasmine.any(Function), element);
		expect(element.matches)
			.toHaveBeenCalledWith(jasmine.any(String));
	});

	it('can perform the type action', async () => {
		let element = 'element';
		let page = 'page';
		let text = 'text';
		typeAction._getText = jest.fn()
			.mockReturnValue(text);
		typeAction._logInfo = jest.fn()
			.mockReturnValue(Promise.resolve());
		typeAction._typeIntoElement = jest.fn()
			.mockReturnValue(Promise.resolve());

		await typeAction.action(element, page);

		expect(typeAction._getText).toHaveBeenCalledTimes(1);
		expect(typeAction._logInfo).toHaveBeenCalledWith(element, text);
		expect(typeAction._typeIntoElement).toHaveBeenCalledWith(page, element, text);
	});

	it('can get text from config', () => {
		typeAction._actionConfig = {
			text: 'text'
		};

		expect(typeAction._getText()).toEqual('text');
	});

	it('can generate random text from faker', () => {
		typeAction._config = {
			typeActionTextTypes: ['name.firstName']
		};

		expect(typeAction._getText()).toEqual(jasmine.any(String));
	});

	it('can type into a specified element', async () => {
		let page = {};
		let element = {
			hover: jest.fn().mockReturnValue(Promise.resolve()),
			type: jest.fn().mockReturnValue(Promise.resolve())
		};
		let text = 'text';
		typeAction._config = {
			typeActionDelay: 50
		};

		await typeAction._typeIntoElement(page, element, text);

		expect(element.hover).toHaveBeenCalledTimes(1);
		expect(element.type)
			.toHaveBeenCalledWith(text, { delay: typeAction._config.typeActionDelay });
	});

	it('can type into a specified element in preview mode', async () => {
		let page = {
			waitFor: jest.fn()
		};
		let element = {
			hover: jest.fn().mockReturnValue(Promise.resolve()),
			type: jest.fn().mockReturnValue(Promise.resolve())
		};
		typeAction._config = {
			headlessModeDisabled: true,
			previewModePauseTime: 99,
			typeActionDelay: 50
		};
		typeAction._actionsHelper.highlightElement = jest.fn()
			.mockReturnValue(Promise.resolve());
		let text = 'text';

		await typeAction._typeIntoElement(page, element, text);

		expect(element.hover).toHaveBeenCalledTimes(1);
		expect(typeAction._actionsHelper.highlightElement)
			.toHaveBeenCalledWith(element);
		expect(page.waitFor).toHaveBeenCalledWith(99);
		expect(element.type)
			.toHaveBeenCalledWith(text, { delay: typeAction._config.typeActionDelay });
	});

	it('can log element info', async () => {
		let element = {};
		let actionsHelper = {
			getElementSelector: jest.fn().mockReturnValue('selector'),
			getElementHTML: jest.fn().mockReturnValue('html')
		};
		typeAction._actionsHelper = actionsHelper;

		await typeAction._logInfo(element, 'text');

		expect(typeAction._results.config.text).toEqual('text');
		expect(typeAction._results.config.selector).toEqual('selector');
		expect(typeAction._results.html).toEqual('html');
		expect(actionsHelper.getElementSelector).toHaveBeenCalledWith(element);
		expect(actionsHelper.getElementHTML).toHaveBeenCalledWith(element);
	});
});
