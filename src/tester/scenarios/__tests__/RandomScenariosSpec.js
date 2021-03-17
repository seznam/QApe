import * as messanger from '../../messanger';
import RandomScenarios from '../RandomScenarios';

describe('RandomScenarios', () => {
    let scenarios = null;
    let startUrl = '/';

    beforeEach(() => {
        messanger.report = jest.fn();
        scenarios = new RandomScenarios({}, {});
    });

    it('can be initialized', () => {
        expect(scenarios._config).toEqual({});
        expect(scenarios._actionsHandler).toEqual({});
    });

    it('can get scenario type', () => {
        expect(scenarios.type).toEqual('random');
    });

    it('can run a random scenario successfully', async () => {
        let response = {
            status: () => 200,
        };
        let page = {
            goto: jest.fn().mockReturnValue(Promise.resolve(response)),
        };
        let instance = { page };
        scenarios._config = {
            url: 'url',
        };
        scenarios._performActions = jest.fn().mockReturnValue('results');

        let results = await scenarios.runScenario(instance, { startUrl });

        expect(messanger.report).toHaveBeenCalledWith('scenario:start', {
            type: 'random',
            scenario: { startUrl },
        });
        expect(page.goto).toHaveBeenCalledWith(`url${startUrl}`);
        expect(scenarios._performActions).toHaveBeenCalledWith(instance);
        expect(messanger.report).toHaveBeenCalledWith('scenario:end', {
            type: 'random',
            scenario: { startUrl },
            results,
        });
        expect(results).toEqual('results');
    });

    it('can handle wrong status code from page load', async () => {
        let response = {
            status: () => 400,
        };
        let page = {
            goto: jest.fn().mockReturnValue(Promise.resolve(response)),
        };
        let instance = { page };
        scenarios._config = {
            url: 'url',
        };

        let results = await scenarios.runScenario(instance, { startUrl });

        expect(messanger.report).toHaveBeenCalledWith('scenario:start', {
            type: 'random',
            scenario: { startUrl },
        });
        expect(page.goto).toHaveBeenCalledWith(`url${startUrl}`);
        expect(messanger.report).toHaveBeenCalledWith('scenario:end', {
            type: 'random',
            scenario: { startUrl },
            results,
        });
        expect(results).toEqual({
            executionError: jasmine.any(String),
        });
    });

    it('can perform random actions and reproduce some page errors', async () => {
        let instance = 'instance';
        let scenario = [{ errors: [] }, { errors: ['error'] }];
        scenarios._config = {
            actionsPerScenario: 5,
            beforeScenarioScript: jest.fn().mockReturnValue(Promise.resolve()),
            afterScenarioScript: jest.fn().mockReturnValue(Promise.resolve()),
        };
        scenarios._actionsHandler = {
            execute: jest
                .fn()
                .mockReturnValueOnce(scenario[0])
                .mockReturnValue(scenario[1]),
        };

        let results = await scenarios._performActions(instance);

        expect(scenarios._config.beforeScenarioScript).toHaveBeenCalledWith(instance);
        expect(scenarios._actionsHandler.execute).toHaveBeenCalledTimes(2);
        expect(scenarios._actionsHandler.execute).toHaveBeenCalledWith(instance);
        expect(results).toEqual({
            scenario,
            errors: scenario[1].errors,
        });
        expect(scenarios._config.afterScenarioScript).toHaveBeenCalledWith(instance);
    });

    it('can perform random actions and pass when no error found', async () => {
        let instance = 'instance';
        scenarios._config = {
            actionsPerScenario: 3,
            beforeScenarioScript: jest.fn().mockReturnValue(Promise.resolve()),
            afterScenarioScript: jest.fn().mockReturnValue(Promise.resolve()),
        };
        scenarios._actionsHandler = {
            execute: jest.fn().mockReturnValue({ errors: [] }),
        };

        let results = await scenarios._performActions(instance);

        expect(scenarios._config.beforeScenarioScript).toHaveBeenCalledWith(instance);
        expect(scenarios._actionsHandler.execute).toHaveBeenCalledTimes(3);
        expect(scenarios._actionsHandler.execute).toHaveBeenCalledWith(instance);
        expect(results).toEqual({
            scenario: [{ errors: [] }, { errors: [] }, { errors: [] }],
            errors: [],
        });
        expect(scenarios._config.afterScenarioScript).toHaveBeenCalledWith(instance);
    });

    it('can perform random actions and handle execution erro when not able to perform any action', async () => {
        let instance = 'instance';
        scenarios._config = {
            actionsPerScenario: 3,
            numberOfActionFailuresToAbortRandomScenario: 2,
            beforeScenarioScript: jest.fn().mockReturnValue(Promise.resolve()),
            afterScenarioScript: jest.fn().mockReturnValue(Promise.resolve()),
        };
        scenarios._actionsHandler = {
            execute: jest.fn().mockReturnValue({ executionError: 'executionError' }),
        };

        let results = await scenarios._performActions(instance);

        expect(scenarios._config.beforeScenarioScript).toHaveBeenCalledWith(instance);
        expect(scenarios._actionsHandler.execute).toHaveBeenCalledTimes(2);
        expect(scenarios._actionsHandler.execute).toHaveBeenCalledWith(instance);
        expect(results).toEqual({
            scenario: [],
            errors: [],
            executionError: jasmine.any(String),
        });
        expect(scenarios._config.afterScenarioScript).toHaveBeenCalledWith(instance);
    });
});
