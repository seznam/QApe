import cluster from 'cluster';
import Config from './shared/config/Config.js';
import fs from 'fs';
import path from 'path';

// Workers
import master from './master';
import tester from './tester';
import reporter from './reporter';
import scriptwriter from './scriptwriter';

/**
 * Sets up a QApe run
 */
export default (configOverride) => {
    const USER_CONFIG_PATH = path.join(process.cwd(), './qape.conf.js');

    let configValues = {};

    if (fs.existsSync(USER_CONFIG_PATH)) {
        configValues = require(USER_CONFIG_PATH);
    }

    let config = Config.load(Object.assign({}, configValues, configOverride));

    if (cluster.isMaster) {
        return master(cluster, config);
    }

    if (process.env.worker_type === 'reporter') {
        return reporter(config);
    }

    if (process.env.worker_type === 'scriptwriter') {
        return scriptwriter(config);
    }

    return tester(config);
};
