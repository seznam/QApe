jest.mock('../reporter/Reporter');

import Reporter from '../reporter/Reporter';
import worker from '../index';

const originalProcessOn = process.on;

describe('Reporter', () => {
    it('can handle events from other workers', () => {
        process.on = jest.fn((_, fn) => {
            fn({
                eventName: 'eventName',
                eventData: 'eventData',
            });
        });
        let reporter = {
            init: jest.fn(() => reporter),
            emit: jest.fn(),
        };
        Reporter.mockImplementation(() => reporter);
        worker({});

        expect(process.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(reporter.emit).toHaveBeenCalledWith('eventName', 'eventData');

        process.on = originalProcessOn;
    });
});
