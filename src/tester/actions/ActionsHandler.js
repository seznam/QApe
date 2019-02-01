import ActionsHelper from './ActionsHelper';
import glob from 'glob-all';
import path from 'path';
import { getRandomElementFromArray } from '../../shared/helpers';

/**
 * Actions handler which can work with specific actions.
 */
export default class ActionsHandler {
	/**
	 * @param {Object} config
	 */
	constructor(config) {
		this._config = config;

		this._actionsHelper = null;

		this._availableActions = {};
	}

	/**
	 * Initializes actions handler dependencies
	 * @returns {ActionsHandler} this
	 */
	init() {
		this._initActionsHelper();
		this._initAvailableActions();

		return this;
	}

	/**
	 * Executes specific, or random action
	 * @param {string} [actionId] Random if not defined
	 * @param {Object} [actionConfig]
	 * @param {Browser} instance
	 * @returns {Promise<Object>} Resolves with action results
	 */
	execute(actionId, actionConfig, instance) {
		let action = this.getAction(actionId);

		if (actionConfig) {
			action.setActionConfig(actionConfig);
		}

		return action.execute(instance);
	}

	/**
	 * Gets random or specific action
	 * @param {string} [actionId]
	 * @returns {AbstractAction} Extended AbstractAction
	 * instance of some specific action
	 */
	getAction(actionId = null) {
		actionId = actionId || this._getRandomAction();
		let Action = this._availableActions[actionId];

		return new Action(this._config, this._actionsHelper);
	}

	/**
	 * Initializes actions helper
	 */
	_initActionsHelper() {
		this._actionsHelper = new ActionsHelper(this._config);
	}

	/**
	 * Initializes available actions
	 */
	_initAvailableActions() {
		glob.sync([
			path.join(__dirname, '!(Abstract)Action.js')
		]).map(actionFile => {
			let action = require(actionFile).default;

			if (this._availableActions[action.id]) {
				throw Error('ActionsHandler: The same action id for multiple actions has been set. Action id must be unique!');
			}

			this._availableActions[action.id] = action;
		});
	}

	/**
	 * Gets random action ID
	 * @returns {string} Random key from this._availableActions
	 */
	_getRandomAction() {
		let randomActions = Object.keys(this._availableActions);

		return getRandomElementFromArray(randomActions);
	}
}
