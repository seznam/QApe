export default class AbstractAction {
	static get id() {
		throw Error('AbstractAction: Id variable must be overwritten with your identifier.');
	}

	constructor(config, actionsHelper) {
		this._config = config;

		this._actionsHelper = actionsHelper;

		this._actionConfig = {};

		this._results = {
			action: this.constructor.id,
			errors: [],
			message: `Action: ${this.constructor.id}; Config: ${this.actionConfig}`
		};
	}

	async execute(instance) {
		const { browser, page, pageErrorHandler } = instance;
		const errorHandler = (error) => this._addErrorToResults(error);
		this._results.beforeLocation = this._getLocation(page);

		pageErrorHandler.on('page-error', errorHandler);

		try {
			await this.action(page, browser);
		} catch (e) {
			this._results.executionError = e;
		}

		if (!page.url().startsWith(this._config.url)) {
			await page.goBack();
		}

		pageErrorHandler.removeListener('page-error', errorHandler);

		this._results.afterLocation = this._getLocation(page);

		return this._results;
	}

	action() {
		throw Error('AbstractAction: Action method must be overwritten!')
	}

	setActionConfig(config) {
		this._actionConfig = config;
	}

	getActionConfig() {
		return this._actionConfig;
	}

	_addErrorToResults(error) {
		this._results.errors.push({
			type: 'pageError',
			error: error
		});
	}

	_getLocation(page) {
		return page.url();
	}
}
