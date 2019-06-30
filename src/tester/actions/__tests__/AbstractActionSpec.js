jest.mock('../../messanger');

import * as messanger from '../../messanger';
import AbstractAction from '../AbstractAction';

describe('AbstractAction', () => {
	let action = null;

	beforeEach(() => {
		// Override id to be able to initialize AbstractAction
		Object.defineProperty(AbstractAction, 'id', {
			get: () => 'id'
		});
		messanger.report = jest.fn();
		action = new AbstractAction({}, {});
	});

	it('can be initialized', () => {
		expect(action._config).toEqual({});
		expect(action._actionsHelper).toEqual({});
		expect(action._actionConfig).toEqual({});
		expect(action._listeners).toEqual([]);
		expect(action._results).toEqual({
			action: 'id',
			errors: [],
			message: jasmine.any(String)
		});
	});

	it('can throw an error if method isActionAvailable is not overrided', () => {
		expect(AbstractAction.isActionAvailable).toThrow();
	});

	it('can evaluate an action', async () => {
		expect(await action.evaluateAction()).toEqual(undefined);
	});

	it('can update results', async () => {
		let results = 'results';

		expect(await action.updateResults(results)).toEqual(results);
	});

	it('can execute an action successfully', async () => {
		let instance = {
			pageErrorHandler: 'pageErrorHandler',
			page: 'page'
		};
		let element = 'element';
		action._results = {};
		action._executeActionLifecycle = jest.fn()
			.mockReturnValue(Promise.resolve());
		action._addEventListener = jest.fn();
		action._clearAllEventListeners = jest.fn();

		let results = await action.execute(element, instance);

		expect(action._executeActionLifecycle)
			.toHaveBeenCalledWith(element, instance);
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.pageErrorHandler, 'page-error', jasmine.any(Function));
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.page, 'response', jasmine.any(Function));;
		expect(results).toEqual({});
	});

	it('can execute an action and handle execution error', async () => {
		let instance = {
			pageErrorHandler: 'pageErrorHandler',
			page: 'page'
		};
		let element = 'element';
		action._results = {};
		action._executeActionLifecycle = jest.fn()
			.mockReturnValue(Promise.reject('error'));
		action._addEventListener = jest.fn();
		action._clearAllEventListeners = jest.fn();
		action._handleExecutionError = jest.fn();

		let results = await action.execute(element, instance);

		expect(action._executeActionLifecycle)
			.toHaveBeenCalledWith(element, instance);
		expect(action._handleExecutionError)
			.toHaveBeenCalledWith('error');
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.pageErrorHandler, 'page-error', jasmine.any(Function));
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.page, 'response', jasmine.any(Function));;
		expect(results).toEqual({});
	});

	it('can execute an action and handle a page error', async () => {
		let instance = {
			pageErrorHandler: 'pageErrorHandler',
			page: 'page'
		};
		let element = 'element';
		let error = 'error';
		action._results = {};
		action._executeActionLifecycle = jest.fn()
			.mockReturnValue(Promise.resolve());
		action._addErrorToResults = jest.fn();
		action._addEventListener = jest.fn((target, event, fn) => {
			if (event === 'page-error') {
				fn(error);
			}
		});
		action._clearAllEventListeners = jest.fn();

		let results = await action.execute(element, instance);

		expect(action._addErrorToResults)
			.toHaveBeenCalledWith(error);
		expect(action._executeActionLifecycle)
			.toHaveBeenCalledWith(element, instance);
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.pageErrorHandler, 'page-error', jasmine.any(Function));
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.page, 'response', jasmine.any(Function));;
		expect(results).toEqual({});
	});

	it('can execute an action and handle wrong request response', async () => {
		let instance = {
			pageErrorHandler: 'pageErrorHandler',
			page: 'page'
		};
		let element = 'element';
		let response = {
			request: () => ({
				url: () => 'url'
			}),
			status: () => 'status'
		}
		action._config = {
			shouldRequestCauseError: () => true
		};
		action._results = {};
		action._addErrorToResults = jest.fn();
		action._executeActionLifecycle = jest.fn()
			.mockReturnValue(Promise.resolve());
		action._addEventListener = jest.fn((target, event, fn) => {
			if (event === 'response') {
				fn(response);
			}
		});
		action._clearAllEventListeners = jest.fn();

		let results = await action.execute(element, instance);

		expect(action._addErrorToResults)
			.toHaveBeenCalledWith(jasmine.any(String));
		expect(action._executeActionLifecycle)
			.toHaveBeenCalledWith(element, instance);
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.pageErrorHandler, 'page-error', jasmine.any(Function));
		expect(action._addEventListener)
			.toHaveBeenCalledWith(instance.page, 'response', jasmine.any(Function));;
		expect(results).toEqual({});
	});

	it('can throw an error if method action is not overrided', () => {
		expect(action.action).toThrow();
	});

	it('can execute action lifecycle', async () => {
		let element = 'element';
		let instance = {
			browser: 'browser',
			page: 'page'
		};
		action.action = jest.fn()
			.mockReturnValue(Promise.resolve());
		action.evaluateAction = jest.fn()
			.mockReturnValue(Promise.resolve());
		action._beforeActionExecute = jest.fn();
		action._afterActionExecute = jest.fn();

		await action._executeActionLifecycle(element, instance);

		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance);
		expect(action.action)
			.toHaveBeenCalledWith(element, instance.page, instance.browser);
		expect(action.evaluateAction)
			.toHaveBeenCalledWith(element, instance.page, instance.browser);
		expect(action._afterActionExecute)
			.toHaveBeenCalledWith(element, instance);
	});

	it('can execute action lifecycle and handle execution error', async () => {
		let element = 'element';
		let instance = {
			browser: 'browser',
			page: 'page'
		};
		action.action = jest.fn()
			.mockReturnValue(Promise.reject('error'));
		action.evaluateAction = jest.fn()
			.mockReturnValue(Promise.resolve());
		action._beforeActionExecute = jest.fn();
		action._afterActionExecute = jest.fn();
		action._handleExecutionError = jest.fn();

		await action._executeActionLifecycle(element, instance);

		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance);
		expect(action.action)
			.toHaveBeenCalledWith(element, instance.page, instance.browser);
		expect(action._handleExecutionError)
			.toHaveBeenCalledWith('error');
		expect(action.evaluateAction)
			.toHaveBeenCalledWith(element, instance.page, instance.browser);
		expect(action._afterActionExecute)
			.toHaveBeenCalledWith(element, instance);
	});

	it('can execute action lifecycle and evaluate action failure', async () => {
		let element = 'element';
		let instance = {
			browser: 'browser',
			page: 'page'
		};
		action.action = jest.fn()
			.mockReturnValue(Promise.resolve());
		action.evaluateAction = jest.fn()
			.mockReturnValue(Promise.reject({ stack: 'error' }));
		action._addErrorToResults = jest.fn();
		action._beforeActionExecute = jest.fn();
		action._afterActionExecute = jest.fn();
		action._handleExecutionError = jest.fn();

		await action._executeActionLifecycle(element, instance);

		expect(action._beforeActionExecute)
			.toHaveBeenCalledWith(instance);
		expect(action.action)
			.toHaveBeenCalledWith(element, instance.page, instance.browser);
		expect(action.evaluateAction)
			.toHaveBeenCalledWith(element, instance.page, instance.browser);
		expect(action._addErrorToResults)
			.toHaveBeenCalledWith('error');
		expect(action._afterActionExecute)
			.toHaveBeenCalledWith(element, instance);
	});

	it('can execute after action scripts', async () => {
		let element = 'element';
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
			pageErrorHandler: 'pageErrorHandler'
		};
		action._results = {};
		action._clearTabs = jest.fn();
		action._config = {
			afterActionScript: jest.fn(),
			afterActionWaitTime: 99,
			url: 'url'
		};
		action._logInfo = jest.fn()
			.mockReturnValue(Promise.resolve());

		await action._afterActionExecute(element, instance);

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
		expect(action._results).toEqual({ afterLocation: 'url' });
		expect(action._logInfo)
			.toHaveBeenCalledWith(element);
		expect(messanger.report)
			.toHaveBeenCalledWith('action:end', {
				action: 'id',
				results: { afterLocation: 'url' }
			});
	});

	it('can execute before action scripts', async () => {
		let instance = {
			browser: 'browser',
			page: {
				url: jest.fn().mockReturnValue('url')
			},
			pageErrorHandler: 'pageErrorHandler'
		};
		action._config = {
			beforeActionScript: jest.fn()
		};
		action._results = {};

		await action._beforeActionExecute(instance);

		expect(action._results).toEqual({
			beforeLocation: 'url'
		});
		expect(action._config.beforeActionScript)
			.toHaveBeenCalledWith(
				instance.browser,
				instance.page,
				instance.pageErrorHandler
			);
		expect(messanger.report)
			.toHaveBeenCalledWith('action:start', { action: 'id' });
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

	it('can add an event listener', () => {
		let target = {
			on: jest.fn()
		};
		let event = 'event';
		let fn = 'fn';

		action._addEventListener(target, event, fn);

		expect(target.on).toHaveBeenCalledWith(event, fn);
		expect(action._listeners).toEqual([{
			target, event, fn
		}]);
	});

	it('can clear all registered event listeners', () => {
		let target = {
			removeListener: jest.fn()
		};
		let event = 'event';
		let fn = 'fn';
		action._listeners = [{
			target, event, fn
		}];

		action._clearAllEventListeners();

		expect(target.removeListener)
			.toHaveBeenCalledWith(event, fn);
		expect(action._listeners).toEqual([]);
	});

	it('can log an element info', async () => {
		let element = 'element';
		let selector = 'selector';
		let html = 'html';
		action._actionsHelper = {
			getElementSelector: jest.fn().mockReturnValue(Promise.resolve(selector)),
			getElementHTML: jest.fn().mockReturnValue(Promise.resolve(html))
		};
		action.updateResults = jest.fn(results => Promise.resolve(results));
		action._results = {};

		await action._logInfo(element);

		expect(action._actionsHelper.getElementSelector)
			.toHaveBeenCalledWith(element);
		expect(action._actionsHelper.getElementHTML)
			.toHaveBeenCalledWith(element);
		expect(action._results)
			.toEqual({
				config: { selector },
				html
			});
	});
});
