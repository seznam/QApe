import template from './template';
import path from 'path';
import _ from 'lodash';

/**
 * Class that can parse configuration with default values.
 */
export default class Config {
    /**
     * Loads configuration with default values
     * @param {Object} [userConfig] Overrides for default config
     */
    static load(userConfig) {
        let config = {};

        if (typeof userConfig === 'string') {
            userConfig = require(path.join(process.cwd(), userConfig));
        }

        Object.keys(template).forEach((key) => (config[key] = template[key].value));

        Object.assign(config, userConfig);

        if (config.previewMode) {
            Config._setPreviewMode(config);
        }

        Config._resolveUrl(config);

        return config;
    }

    /**
     * If url is configured with url path (https://www.example.com/index.html),
     * then this method splits the configuration into `url` and `urlPaths`.
     *
     * @example Following config
     * `{ url: 'https://www.example.com/index.html' }`
     * would be transformed into the following config
     * `{ url: 'https://www.example.com', urlPaths: ['/index.html'] }`
     * @param {Object} config
     */
    static _resolveUrl(config) {
        const host = config.url.replace(/http(s)?:\/\//, '');

        if (host.includes('/')) {
            const urlPaths = [host.substring(host.indexOf('/'))];
            const urlPathMatcher = new RegExp(_.escapeRegExp(urlPaths[0]) + '$');
            const url = config.url.replace(urlPathMatcher, '');

            Object.assign(config, { url, urlPaths });
        }
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
            headlessModeDisabled: true,
        });
    }
}
