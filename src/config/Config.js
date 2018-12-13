import template from './template';

/**
 * Class that can parse configuration with default values.
 */
export default class Config {
	/**
	 * Loads configuration with default values
	 * @param {Object} config Overrides for default config
	 */
	static load(userConfig) {
		let config = {};

		if (typeof userConfig === 'string') {
			userConfig = require(path.join(process.cwd(), userConfig));
		}

		Object
			.keys(template)
			.forEach(key => config[key] = template[key].value);

		Object.assign(config, userConfig);

		if (config.previewMode) {
			Config._setPreviewMode(config);
		}

		return config;
	}

	/**
	 * Overrides preview mode configurations
	 * @param {Object} config
	 */
	static _setPreviewMode(config) {
		Object.assign(config, {
			parallelInstances: 1,
			randomScenariosDisabled: true,
			minifyUserDefinedScenarios: false,
			headlessModeDisabled: true
		});
	}
}
