import ActionsHelper from './ActionsHelper';
import glob from 'glob-all';
import path from 'path';
import { getRandomElementFromArray } from '../helpers';

const localActionsPattern = [
	path.join(__dirname, '!(Abstract)Action.js')
];

export default class ActionsHandler {
	constructor(config, reporter) {
		this._config = config;

		this._reporter = reporter;

		this._actionsHelper = null;

		this._availableActions = {};
	}

	init() {
		this._initActionsHelper();
		this._initAvailableActions();

		return this;
	}

	execute(actionId, actionConfig, instance) {
		let action = this.getAction(actionId);

		if (actionConfig) {
			action.setActionConfig(actionConfig);
		}

		return action.execute(instance);
	}

	getAction(actionId = null) {
		actionId = actionId || this._getRandomAction();
		let Action = this._availableActions[actionId];

		return new Action(this._config, this._actionsHelper, this._reporter);
	}

	_initActionsHelper() {
		this._actionsHelper = new ActionsHelper(this._config);
	}

	_initAvailableActions() {
		glob.sync(localActionsPattern)
			.map(actionFile => {
				let action = require(actionFile).default;

				if (this._availableActions[action.id]) {
					throw Error('ActionsHandler: The same action id for multiple actions has been set. Action id must be unique!');
				}

				this._availableActions[action.id] = action;
			});
	}

	_getRandomAction() {
		let randomActions = Object.keys(this._availableActions);

		return getRandomElementFromArray(randomActions);
	}
}
