jest.mock('../../messanger');

import * as messanger from '../../messanger';
import DefinedScenarios from '../DefinedScenarios';

describe('DefinedScenarios', () => {
    let scenarios = null;

    beforeEach(() => {
        // eslint-disable-next-line no-import-assign
        messanger.report = jest.fn();
        scenarios = new DefinedScenarios({}, {});
    });

    it('can be initialized', () => {
        expect(scenarios._config).toEqual({});
        expect(scenarios._scenariosHelper).toEqual({});
    });

    it('can get scenario type', () => {
        expect(scenarios.type).toEqual('defined');
    });

    it('can run defined scenario steps', async () => {
        let instance = 'instance';
        let scenario = ['action1', 'action2', 'action3'];
        let name = 'name';
        scenarios._scenariosHelper = {
            runScenario: jest.fn().mockReturnValue({}),
        };

        await scenarios.runScenario(instance, { name, scenario });

        expect(messanger.report).toHaveBeenCalledWith('scenario:start', {
            type: 'defined',
            name,
            scenario,
        });
        expect(scenarios._scenariosHelper.runScenario).toHaveBeenCalledWith(instance, scenario);
        expect(messanger.report).toHaveBeenCalledWith('scenario:end', {
            type: 'defined',
            name,
            scenario,
            results: {},
        });
    });

    it('can run defined scenario steps and handle errors', async () => {
        let instance = 'instance';
        let scenario = ['action1', 'action2', 'action3'];
        let name = 'name';
        scenarios._config = {
            minifyUserDefinedScenarios: true,
        };
        scenarios._scenariosHelper = {
            runScenario: jest.fn().mockReturnValue({ errors: ['error'] }),
        };

        let results = await scenarios.runScenario(instance, { scenario, name });

        expect(messanger.report).toHaveBeenCalledWith('scenario:start', {
            type: 'defined',
            name,
            scenario,
        });
        expect(scenarios._scenariosHelper.runScenario).toHaveBeenCalledWith(instance, scenario);
        expect(messanger.report).toHaveBeenCalledWith('scenario:end', {
            type: 'defined',
            name,
            scenario,
            results,
        });
        expect(results).toEqual({ errors: ['error'] });
    });
});
