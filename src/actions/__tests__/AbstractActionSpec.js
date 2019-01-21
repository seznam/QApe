import AbstractAction from '../AbstractAction';

describe('AbstractAction', () => {
	let action = null;

	beforeEach(() => {
		// Override id to be able to initialize AbstractAction
		Object.defineProperty(AbstractAction, 'id', {
			get: () => 'id'
		});
		action = new AbstractAction({}, {}, {});
	});

	it('can be initialized', () => {
		expect(action._config).toEqual({});
		expect(action._actionsHelper).toEqual({});
		expect(action._reporter).toEqual({});
		expect(action._actionConfig).toEqual({});
		expect(action._results).toEqual({
			action: 'id',
			errors: [],
			message: jasmine.any(String)
		});
	});

	it('can execute an action successfully', async () => {
		let instance = 'instance';
		action._results = {};
		action._addErrorToResults = jest.fn();
		action._executeActionLifecycle = jest.fn((_, errorHandler) => {
			errorHandler('error');

			return Promise.resolve();
		});

		let results = await action.execute(instance);

		expect(action._executeActionLifecycle)
			.toHaveBeenCalledWith(instance, jasmine.any(Function));
		expect(action._addErrorToResults)
			.toHaveBeenCalledWith('error');
		expect(results).toEqual({});
	});

	it('can execute an action and handle execution error', async () => {
		let instance = 'instance';
		action._results = {};
		action._addErrorToResults = jest.fn();
		action._executeActionLifecycle = jest.fn()
			.mockReturnValue(Promise.reject('error'));
		action._handleExecutionError = jest.fn();

		let results = await action.execute(instance);

		expect(action._executeActionLifecycle)
			.toHaveBeenCalledWith(instance, jasmine.any(Function));
		expect(action._handleExecutionError)
			.toHaveBeenCalledWith(instance, 'error');
		expect(results).toEqual({});
	});

	it('can throw an error if method action is not overrided', () => {
		expect(action.action).toThrow();
	});

	it('can set action config', () => {
		let config = 'config';

		action.setActionConfig(config);

		expect(action._actionConfig).toEqual(config);
	});

	it('can get action config', () => {
		let config = 'config';
		action._actionConfig = config;

		expect(action.getActionConfig()).toEqual(config);
	});

	it('can execute action lifecycle', async () => {
		let instance = {
			browser: 'browser',
			page: 'page'
		};
		let errorHandler = 'errorHandler'
		action.action = jest.fn()
			.mockReturnValue(Promise.resolve());
		action._beforeActionExecute = jest.fn();
		action._afterActionExecute = jest.fn();

		await action._executeActionLifecycle(instance, errorHandler);

		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance, errorHandler);
		expect(action.action)
			.toHaveBeenCalledWith(instance.page, instance.browser);
		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance, errorHandler);
	});

	it('can execute action lifecycle and handle execution error', async () => {
		let instance = {
			browser: 'browser',
			page: 'page'
		};
		let errorHandler = 'errorHandler'
		action.action = jest.fn()
			.mockReturnValue(Promise.reject('error'));
		action._beforeActionExecute = jest.fn();
		action._afterActionExecute = jest.fn();
		action._handleExecutionError = jest.fn();

		await action._executeActionLifecycle(instance, errorHandler);

		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance, errorHandler);
		expect(action.action)
			.toHaveBeenCalledWith(instance.page, instance.browser);
		expect(action._handleExecutionError)
			.toHaveBeenCalledWith(instance, 'error');
		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance, errorHandler);
	});

	it('can execute after action scripts', async () => {
		let errorHandler = 'errorHandler';
		let removedPageErrorListeners = [];
		let instance = {
			browser: 'browser',
			page: {
				url: jest.fn()
					.mockReturnValueOnce('afterUrl')
					.mockReturnValue('url'),
				waitFor: jest.fn()
					.mockReturnValue(Promise.resolve()),
				goBack: jest.fn()
					.mockReturnValue(Promise.resolve()),
				bringToFront: jest.fn()
					.mockReturnValue(Promise.resolve())
			},
			pageErrorHandler: {
				removeListener: jest.fn((eventName, handler) => removedPageErrorListeners.push({ eventName, handler }))
			}
		};
		action._results = {};
		action._reporter = {
			emit: jest.fn()
		};
		action._clearTabs = jest.fn();
		action._config = {
			afterActionScript: jest.fn(),
			afterActionWaitTime: 99,
			url: 'url'
		};

		await action._afterActionExecute(instance, errorHandler);

		expect(instance.page.bringToFront).toHaveBeenCalled();
		expect(action._config.afterActionScript)
			.toHaveBeenCalledWith(
				instance.browser,
				instance.page,
				instance.pageErrorHandler
			);
		expect(action._clearTabs)
			.toHaveBeenCalledWith(instance.browser);
		expect(instance.page.url).toHaveBeenCalled();
		expect(instance.page.goBack).toHaveBeenCalled();
		expect(instance.page.waitFor)
			.toHaveBeenCalledWith(99);
		expect(instance.pageErrorHandler.removeListener)
			.toHaveBeenCalledWith('page-error', errorHandler);
		expect(action._results).toEqual({ afterLocation: 'url' });
		expect(action._reporter.emit)
			.toHaveBeenCalledWith('action:end', {
				instance,
				action: 'id',
				results: { afterLocation: 'url' }
			});
		expect(removedPageErrorListeners).toEqual([{
			eventName: 'page-error',
			handler: errorHandler
		}]);
	});

	it('can execute before action scripts', () => {
		let pageErrorListeners = [];
		let errorHandler = 'errorHandler';
		let instance = {
			browser: 'browser',
			page: {
				url: jest.fn()
					.mockReturnValue('url')
			},
			pageErrorHandler: {
				on: jest.fn((eventName, handler) => pageErrorListeners.push({ eventName, handler }))
			}
		}
		action._reporter = {
			emit: jest.fn()
		};
		action._config = {
			beforeActionScript: jest.fn()
		};
		action._results = {};

		action._beforeActionExecute(instance, errorHandler);

		expect(action._results).toEqual({
			beforeLocation: 'url'
		});
		expect(instance.pageErrorHandler.on)
			.toHaveBeenCalledWith('page-error', errorHandler);
		expect(action._config.beforeActionScript)
			.toHaveBeenCalledWith(
				instance.browser,
				instance.page,
				instance.pageErrorHandler
			);
		expect(action._reporter.emit)
			.toHaveBeenCalledWith('action:start', {
				instance,
				action: 'id'
			});
	});

	it('can add an error to the results', () => {
		let error = 'error';
		action._results = { errors: [] };

		action._addErrorToResults(error);

		expect(action._results).toEqual({
			errors: [{ type: 'pageError', error }]
		});
	});

	it('can clear tabs created during action execution', async () => {
		let pages = [
			{ close: jest.fn().mockReturnValue(Promise.resolve()) },
			{ close: jest.fn().mockReturnValue(Promise.resolve()) }
		]
		let browser = {
			pages: jest.fn()
				.mockReturnValue(Promise.resolve(pages))
		};

		await action._clearTabs(browser);

		expect(browser.pages).toHaveBeenCalled();
		expect(pages[0].close).not.toHaveBeenCalled();
		expect(pages[1].close).toHaveBeenCalled();
	});
});
