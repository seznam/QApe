jest.mock('../ActionsHelper');

import ActionsHandler from '../ActionsHandler';
import ActionsHelper from '../ActionsHelper';

describe('ActionsHandler', () => {
	let actionsHandler = null;

	beforeEach(() => {
		actionsHandler = new ActionsHandler({});
	});

	it('can be initialized', () => {
		actionsHandler._initActionsHelper = jest.fn();
		actionsHandler._loadActions = jest.fn();

		actionsHandler.init();

		expect(actionsHandler._config).toEqual({});
		expect(actionsHandler._actionsHelper).toEqual(null);
		expect(actionsHandler._actions).toEqual({});
		expect(actionsHandler._initActionsHelper).toHaveBeenCalledTimes(1);
		expect(actionsHandler._loadActions).toHaveBeenCalledTimes(1);
	});

	it('can execute action', async () => {
		let actionId = 'id';
		let actionConfig = 'actionConfig';
		let instance = { page: 'page' };
		let actionInstance = {
			execute: jest.fn()
		};
		let Action = jest.fn()
			.mockImplementation(() => actionInstance);
		let element = 'element';
		actionsHandler._getAction = jest.fn()
			.mockReturnValue(Promise.resolve({ Action, element }));
		actionsHandler._actionsHelper = {
			waitForReadyState: jest.fn()
				.mockReturnValue(Promise.resolve())
		};

		await actionsHandler.execute(instance, actionId, actionConfig);

		expect(actionsHandler._actionsHelper.waitForReadyState)
			.toHaveBeenCalledWith(instance.page);
		expect(actionsHandler._getAction)
			.toHaveBeenCalledWith(instance, actionId, actionConfig);		
		expect(Action)
			.toHaveBeenCalledWith(actionsHandler._config, actionsHandler._actionsHelper, actionConfig);
		expect(actionInstance.execute).toHaveBeenCalledWith(element, instance);
	});

	it('can get action by ID and actionConfig', async () => {
		let instance = { page: 'page' };
		let actionId = 'id';
		let actionConfig = { selector: 'selector' };
		let element = 'element';
		class DummyAction {};
		actionsHandler._actions = { id: DummyAction };
		actionsHandler._actionsHelper = {
			getElement: jest.fn()
				.mockReturnValue(Promise.resolve(element))
		}

		let results = await actionsHandler._getAction(instance, actionId, actionConfig);

		expect(results).toEqual({ Action: DummyAction, element });
		expect(actionsHandler._actionsHelper.getElement)
			.toHaveBeenCalledWith(instance.page, actionConfig);
	});

	it('can get action by ID and without actionConfig', async () => {
		let instance = { page: 'page' };
		let actionId = 'id';
		let element = 'element';
		class DummyAction {};
		actionsHandler._actions = { id: DummyAction };
		actionsHandler._getAvailablePageActions = jest.fn()
			.mockReturnValue(Promise.resolve([{
				Action: DummyAction, element
			}]));

		let results = await actionsHandler._getAction(instance, actionId);

		expect(results).toEqual({ Action: DummyAction, element });
		expect(actionsHandler._getAvailablePageActions)
			.toHaveBeenCalledWith(instance.page, [actionId]);
	});

	it('can get random action', async () => {
		let instance = { page: 'page' };
		let element = 'element';
		class DummyAction {};
		actionsHandler._actions = { id: DummyAction };
		actionsHandler._getAvailablePageActions = jest.fn()
			.mockReturnValue(Promise.resolve([{
				Action: DummyAction, element
			}]));

		let results = await actionsHandler._getAction(instance);

		expect(results).toEqual({ Action: DummyAction, element });
		expect(actionsHandler._getAvailablePageActions)
			.toHaveBeenCalledWith(instance.page, ['id']);
	});

	it('can initialize actions helper', () => {
		actionsHandler._initActionsHelper();

		expect(
			actionsHandler._actionsHelper instanceof ActionsHelper
		).toEqual(true);
	});
});
