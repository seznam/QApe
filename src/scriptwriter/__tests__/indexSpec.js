jest.mock('../scenarios/ScenariosHandler');

import Scenarios from '../scenarios/ScenariosHandler';
import scriptwriter from '../index';

const originalProcessOn = process.on;
const originalProcessSend = process.send;

describe('Scriptwriter', () => {
    afterEach(() => {
        process.on = originalProcessOn;
        process.send = originalProcessSend;
    });

    it('can send a scenario to a tester', () => {
        let scenarios = {
            init: jest.fn(() => scenarios),
            getScenario: jest.fn().mockReturnValue('scenario'),
        };
        let msg = {
            eventName: 'GET',
            workerId: 1,
        };
        Scenarios.mockImplementation(() => scenarios);
        process.on = jest.fn((_, fn) => {
            fn(msg);
        });
        process.send = jest.fn();

        scriptwriter();

        expect(process.on).toHaveBeenCalledWith('message', jasmine.any(Function));
        expect(process.send).toHaveBeenCalledWith({
            reciever: 'tester',
            eventData: 'scenario',
            workerId: 1,
        });
    });

    it('can recieve a failing scenario from a tester', () => {
        let scenarios = {
            init: jest.fn(() => scenarios),
            addFailingScenario: jest.fn(),
        };
        let msg = {
            eventName: 'POST',
            eventData: 'eventData',
        };
        Scenarios.mockImplementation(() => scenarios);
        process.on = jest.fn((_, fn) => {
            fn(msg);
        });

        scriptwriter();

        expect(process.on).toHaveBeenCalledWith('message', jasmine.any(Function));
        expect(scenarios.addFailingScenario).toHaveBeenCalledWith('eventData');
    });
});
