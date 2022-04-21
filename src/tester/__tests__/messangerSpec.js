import { report, requestScenario, sendFailingScenario } from '../messanger';

const originalProcessSend = process.send;
const originalProcessOnce = process.once;

describe('Messanger', () => {
    beforeEach(() => {
        process.send = jest.fn();
    });

    afterEach(() => {
        process.send = originalProcessSend;
    });

    it('can report an event to reporter', () => {
        let eventName = 'event';
        let eventData = 'data';

        report(eventName, eventData);

        expect(process.send).toHaveBeenCalledWith({
            reciever: 'reporter',
            eventName,
            eventData,
        });
    });

    it('can request a scenario from scriptwriter', async () => {
        let scenario = 'scenario';
        process.once = jest.fn((_, fn) => {
            fn(scenario);
        });

        let results = await requestScenario();

        expect(results).toEqual(scenario);
        expect(process.once).toHaveBeenCalledWith('message', expect.any(Function));
        expect(process.send).toHaveBeenCalledWith({
            reciever: 'scriptwriter',
            eventName: 'GET',
        });

        process.once = originalProcessOnce;
    });

    it('can send a failing scenario to scriptwriter', () => {
        let scenario = 'scenario';

        sendFailingScenario(scenario);

        expect(process.send).toHaveBeenCalledWith({
            reciever: 'scriptwriter',
            eventName: 'POST',
            eventData: scenario,
        });
    });
});
