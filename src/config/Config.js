import template from './template';
import path from 'path';

export default class Config {
	constructor(config) {
		this._config = config;
	}

	load(config) {
		let configValues = config;
		let defaultValues = {};

		if (typeof config === 'string') {
			configValues = require(path.join(process.cwd(), config));
		}

		Object
			.keys(template)
			.forEach(key => defaultValues[key] = template[key].value);

		this._config = Object.assign(defaultValues, configValues);

		if (this._config.previewMode) {
			this._setPreviewMode();
		}

		this._resolvePathVariables();

		return this._config;
	}

	_setPreviewMode() {
		this._config = Object.assign(this._config, {
			parallelInstances: 1,
			randomScenariosDisabled: true,
			minifyUserDefinedScenarios: false,
			headlessModeDisabled: true
		});
	}

	_resolvePathVariables() {
		let pathVariables = ['reportPath'];

		pathVariables.forEach(
			variable => this._config[variable] = path.resolve(this._config[variable])
		);
	}
}
