jest.mock('../Runner');

import Runner from '../Runner';
import tester from '../index';

const originalConsoleError = console.error;
const originalProcessExit = process.exit;

describe('Tester', () => {
    beforeEach(() => {
        console.error = jest.fn();
        process.exit = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        process.exit = originalProcessExit;
    });

    it('can run a successful test run', async () => {
        let runner = {
            start: jest.fn().mockReturnValue(Promise.resolve()),
        };
        Runner.mockImplementation(() => runner);

        await tester();

        expect(runner.start).toHaveBeenCalled();
    });

    it('can run a unsuccessful test run', async () => {
        let runner = {
            start: jest.fn().mockReturnValue(Promise.reject('error')),
        };
        Runner.mockImplementation(() => runner);

        await tester();

        expect(runner.start).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('error');
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
