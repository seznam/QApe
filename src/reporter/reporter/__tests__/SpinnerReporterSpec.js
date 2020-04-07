import SpinnerReporter from '../SpinnerReporter';
import readline from 'readline';

describe('SpinnerReporter', () => {
    let reporter = null;
    let stdout = null;

    beforeEach(() => {
        stdout = {
            isTTY: true,
            write: jest.fn(),
            rows: 1,
        };
        reporter = new SpinnerReporter({}, stdout);
    });

    it('can be initialized', () => {
        expect(reporter._config).toEqual({});
        expect(reporter._stdout).toEqual(stdout);
        expect(reporter._index).toEqual(0);
    });

    it('can handle event which should cause a spin', () => {
        let currentSpinnerIndex = reporter._index;
        reporter._clearSpinner = jest.fn();
        readline.cursorTo = jest.fn();

        reporter._handleEvent();

        expect(reporter._clearSpinner).toHaveBeenCalled();
        expect(stdout.write).toHaveBeenCalledWith(jasmine.any(String));
        expect(readline.cursorTo).toHaveBeenCalledWith(stdout, 0, 0);
        expect(reporter._index).toEqual(currentSpinnerIndex + 1);
    });

    it('can handle runner end', () => {
        reporter._clearSpinner = jest.fn();

        reporter._handleRunnerEnd();

        expect(reporter._clearSpinner).toHaveBeenCalled();
    });

    it('can clear the spinner', () => {
        readline.cursorTo = jest.fn();
        readline.clearLine = jest.fn();

        reporter._clearSpinner();

        expect(readline.cursorTo).toHaveBeenCalledWith(stdout, 0, 1);
        expect(readline.clearLine).toHaveBeenCalledWith(stdout, 0);
    });
});
