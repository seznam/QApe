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

        this._actions = {};
    }

    /**
     * Initializes actions handler dependencies
     * @returns {ActionsHandler} this
     */
    init() {
        this._initActionsHelper();
        this._loadActions();

        return this;
    }

    /**
     * Executes specific, or random action
     * @param {Browser} instance
     * @param {string} [actionId] Random if not defined
     * @param {Object} [actionConfig]
     * @returns {Promise<Object>} Resolves with action results
     */
    async execute(instance, actionId, actionConfig) {
        let pageAction;

        try {
            await this._actionsHelper.waitForReadyState(instance.page);
            pageAction = await this._getAction(instance, actionId, actionConfig);
        } catch (e) {
            return { executionError: e.stack };
        }

        if (!pageAction) {
            return { executionError: 'pageAction not defined!' };
        }

        let { Action, element } = pageAction;
        let action = new Action(this._config, this._actionsHelper, actionConfig);

        return action.execute(element, instance);
    }

    /**
     * Gets random or specific action
     * @param {Browser} instance
     * @param {string} [actionId]
     * @param {Object} [actionConfig]
     * @returns {Object} { Action, element }
     */
    async _getAction({ page }, actionId, actionConfig) {
        if (actionId && actionConfig && actionConfig.selector) {
            return {
                Action: this._actions[actionId],
                element: await this._actionsHelper.getElement(page, actionConfig),
            };
        }

        let actions = actionId ? [actionId] : Object.keys(this._actions);
        let pageActions = await this._getAvailablePageActions(page, actions);

        return getRandomElementFromArray(pageActions);
    }

    /**
     * Initializes actions helper
     */
    _initActionsHelper() {
        this._actionsHelper = new ActionsHelper(this._config);
    }

    /**
     * Loads all defined actions
     */
    _loadActions() {
        let paths = [path.join(__dirname, '!(Abstract)Action.js')];

        if (this._config.customActions && this._config.customActions.length > 0) {
            this._config.customActions.forEach(action => paths.push(path.join(process.cwd(), action)));
        }

        glob.sync(paths).map(actionFile => {
            let action = require(actionFile).default;

            if (this._actions[action.id]) {
                throw Error(
                    'ActionsHandler: The same action id for multiple actions has been set. Action id must be unique!'
                );
            }

            this._actions[action.id] = action;
        });
    }

    /**
     * @param {puppeteer.Page} page
     * @param {string[]} availableActionIds
     * @returns {Promise<Object[]>} Returns array of objects with keys
     * Action and element, which are all available page actions
     */
    async _getAvailablePageActions(page, availableActionIds) {
        let elements = await this._actionsHelper.getAllVisiblePageElements(page);
        let actions = [];

        await Promise.all(
            elements.map(element => {
                return Promise.all(
                    availableActionIds.map(async id => {
                        let Action = this._actions[id];

                        if (await Action.isActionAvailable(element, page, this._config)) {
                            actions.push({ Action, element });
                        }
                    })
                );
            })
        );

        return actions;
    }
}
