/* eslint-disable no-import-assign */

jest.mock('../browser/Browser');
jest.mock('../scenarios/ScenariosHandler');
jest.mock('../actions/ActionsHandler');
jest.mock('../../shared/config/Config');
jest.mock('../messanger');
jest.mock('fs');

import Runner from '../Runner';
import Browser from '../browser/Browser';
import ScenariosHandler from '../scenarios/ScenariosHandler';
import ActionsHandler from '../actions/ActionsHandler';
import * as messanger from '../messanger';

const consoleErrorOrig = console.error;

describe('Runner', () => {
    let runner = null;

    beforeEach(() => {
        messanger.requestScenario = jest.fn().mockReturnValue(Promise.resolve());
        messanger.sendScenario = jest.fn();
        messanger.report = jest.fn();
        runner = new Runner({});
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = consoleErrorOrig;
    });

    it('can be initialized', () => {
        runner._initActionsHandler = jest.fn();
        runner._initScenariosHandler = jest.fn();

        runner._init();

        expect(runner._initActionsHandler).toHaveBeenCalledTimes(1);
        expect(runner._initScenariosHandler).toHaveBeenCalledTimes(1);
        expect(runner._config).toEqual({});
        expect(runner._scenariosHandler).toEqual(null);
        expect(runner._actionsHandler).toEqual(null);
    });

    it('can start QApe run and handle success', async () => {
        runner._init = jest.fn();
        runner._startInstance = jest.fn().mockReturnValue(Promise.resolve());

        await runner.start();

        expect(runner._init).toHaveBeenCalled();
        expect(runner._startInstance).toHaveBeenCalledTimes(1);
    });

    it('can start QApe run and handle error', async () => {
        runner._init = jest.fn();
        runner._startInstance = jest.fn().mockReturnValue(Promise.resolve());
        runner._isSuccess = false;

        let rejected = false;

        try {
            await runner.start();
        } catch (e) {
            rejected = true;
        }

        expect(rejected).toEqual(true);
        expect(runner._init).toHaveBeenCalled();
        expect(runner._startInstance).toHaveBeenCalledTimes(1);
    });

    it('can start a test instance and handle run without errors', async () => {
        let instance = { clear: jest.fn() };
        messanger.requestScenario = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve({ type: 'random', scenario: 'scenario' }))
            .mockReturnValue(Promise.resolve({}));
        runner._config = {
            randomScenariosDisabled: false,
        };
        runner._scenariosHandler = {
            runScenario: jest.fn().mockReturnValue(Promise.resolve()),
        };
        runner._getBrowserInstance = jest.fn().mockReturnValue(Promise.resolve(instance));

        await runner._startInstance();

        expect(runner._scenariosHandler.runScenario).toHaveBeenCalledTimes(1);
        expect(runner._getBrowserInstance).toHaveBeenCalledTimes(1);
        expect(messanger.report).toHaveBeenCalledWith('runner:start', { scenario: 'scenario' });
        expect(instance.clear).toHaveBeenCalledTimes(1);
        expect(messanger.report).toHaveBeenCalledWith('runner:end');
        expect(runner._isSuccess).toEqual(true);
    });

    it('can start a test instance and handle run with page errors', async () => {
        let instance = { clear: jest.fn() };
        messanger.requestScenario = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve({ type: 'random', scenario: 'scenario' }))
            .mockReturnValue(Promise.resolve({}));
        runner._config = {
            randomScenariosDisabled: false,
        };
        runner._scenariosHandler = {
            runScenario: jest.fn().mockReturnValue(
                Promise.resolve({
                    errors: ['error'],
                })
            ),
        };
        runner._getBrowserInstance = jest.fn().mockReturnValue(Promise.resolve(instance));

        await runner._startInstance();

        expect(runner._scenariosHandler.runScenario).toHaveBeenCalledTimes(1);
        expect(runner._getBrowserInstance).toHaveBeenCalledTimes(1);
        expect(messanger.report).toHaveBeenCalledWith('runner:start', { scenario: 'scenario' });
        expect(runner._isSuccess).toEqual(false);
        expect(messanger.sendFailingScenario).toHaveBeenCalledWith({ errors: ['error'] });
        expect(instance.clear).toHaveBeenCalledTimes(1);
        expect(messanger.report).toHaveBeenCalledWith('runner:end');
    });

    it('can start a test instance and handle run with unknown execution errors', async () => {
        let instance = { clear: jest.fn(), unknownExecutionErrorOccured: true };
        messanger.requestScenario = jest
            .fn()
            .mockReturnValueOnce(Promise.resolve({ type: 'random', scenario: 'scenario' }))
            .mockReturnValue(Promise.resolve({}));
        runner._config = {
            randomScenariosDisabled: false,
        };
        runner._scenariosHandler = {
            runScenario: jest.fn().mockReturnValue(Promise.reject({ stack: 'executionError' })),
        };
        runner._getBrowserInstance = jest.fn().mockReturnValue(Promise.resolve(instance));

        await runner._startInstance();

        expect(runner._scenariosHandler.runScenario).toHaveBeenCalledTimes(1);
        expect(runner._getBrowserInstance).toHaveBeenCalledTimes(1);
        expect(messanger.report).toHaveBeenCalledWith('runner:start', { scenario: 'scenario' });
        expect(messanger.report).toHaveBeenCalledWith('runner:error', {
            scenario: 'scenario',
            error: 'executionError',
        });
        expect(instance.clear).toHaveBeenCalledTimes(1);
        expect(messanger.report).toHaveBeenCalledWith('runner:end');
        expect(runner._isSuccess).toEqual(false);
    });

    it('can initialize all dependencies', () => {
        runner._initActionsHandler = jest.fn();
        runner._initScenariosHandler = jest.fn();

        runner._init();

        expect(runner._initActionsHandler).toHaveBeenCalledTimes(1);
        expect(runner._initScenariosHandler).toHaveBeenCalledTimes(1);
    });

    it('can get browser instance', () => {
        let instance = {
            initBrowser: jest.fn().mockReturnValue('instance'),
        };
        Browser.mockImplementation(() => instance);

        expect(runner._getBrowserInstance()).toEqual('instance');
        expect(instance.initBrowser).toHaveBeenCalled();
        Browser.mockRestore();
    });

    it('can initialize actions handler', () => {
        let actionsHandler = {
            init: jest.fn().mockReturnValue('actionsHandler'),
        };
        ActionsHandler.mockImplementation(() => actionsHandler);

        runner._initActionsHandler();

        expect(runner._actionsHandler).toEqual('actionsHandler');
        expect(actionsHandler.init).toHaveBeenCalled();
        ActionsHandler.mockRestore();
    });

    it('can initialize scenarios handler', () => {
        let scenariosHandler = {
            init: jest.fn().mockReturnValue('scenariosHandler'),
        };
        ScenariosHandler.mockImplementation(() => scenariosHandler);

        runner._initScenariosHandler();

        expect(runner._scenariosHandler).toEqual('scenariosHandler');
        expect(scenariosHandler.init).toHaveBeenCalled();
        ScenariosHandler.mockRestore();
    });
});
