jest.mock('../ActionsHelper');

import ActionsHandler from '../ActionsHandler';
import ActionsHelper from '../ActionsHelper';

class DummyAction {}

describe('ActionsHandler', () => {
	let actionsHandler = null;

	beforeEach(() => {
		actionsHandler = new ActionsHandler({});
	});

	it('can be initialized', () => {
		actionsHandler._initActionsHelper = jest.fn();
		actionsHandler._initAvailableActions = jest.fn();

		actionsHandler.init();

		expect(actionsHandler._config).toEqual({});
		expect(actionsHandler._actionsHelper).toEqual(null);
		expect(actionsHandler._availableActions).toEqual({});
		expect(actionsHandler._initActionsHelper).toHaveBeenCalledTimes(1);
		expect(actionsHandler._initAvailableActions).toHaveBeenCalledTimes(1);
	});

	it('can execute specific action without config', () => {
		let actionId = 'id';
		let instance = {};
		let execute = jest.fn();
		actionsHandler.getAction = jest.fn().mockReturnValue({ execute });

		actionsHandler.execute(actionId, null, instance);

		expect(actionsHandler.getAction).toHaveBeenCalledWith(actionId);
		expect(execute).toHaveBeenCalledWith(instance);
	});

	it('can execute specific action with config', () => {
		let actionId = 'id';
		let config = { key: 'value' };
		let instance = {};
		let execute = jest.fn();
		let setActionConfig = jest.fn();
		actionsHandler.getAction = jest.fn().mockReturnValue({ execute, setActionConfig });

		actionsHandler.execute(actionId, config, instance);

		expect(actionsHandler.getAction).toHaveBeenCalledWith(actionId);
		expect(setActionConfig).toHaveBeenCalledWith(config);
		expect(execute).toHaveBeenCalledWith(instance);
	});

	it('can get action by ID', () => {
		actionsHandler._availableActions = { id: DummyAction };

		let action = actionsHandler.getAction('id');

		expect(action instanceof DummyAction).toBeTruthy();
	});

	it('can initialize actions helper', () => {
		actionsHandler._initActionsHelper();

		expect(
			actionsHandler._actionsHelper instanceof ActionsHelper
		).toEqual(true);
	});
});
