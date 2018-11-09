import Progress from '../Progress';

describe('Progress', () => {
	let progress = null;
	let stderrWrite = process.stderr.write;
	let stderrClearLine = process.stderr.clearLine;
	let stderrCursorTo = process.stderr.cursorTo;
	let stderrIsTTY = process.stderr.isTTY;
	let stderrMoveCursor = process.stderr.moveCursor;

	beforeEach(() => {
		process.stderr.write = jest.fn();
		process.stderr.clearLine = jest.fn();
		process.stderr.cursorTo = jest.fn();
		process.stderr.isTTY = true;
		process.stderr.moveCursor = jest.fn();
		progress = new Progress({});
	});

	afterEach(() => {
		process.stderr.write = stderrWrite;
		process.stderr.clearLine = stderrClearLine;
		process.stderr.cursorTo = stderrCursorTo;
		process.stderr.isTTY = stderrIsTTY;
		process.stderr.moveCursor = stderrMoveCursor;
	});

	it('can be initialized', () => {
		expect(progress._config).toEqual({});
		expect(progress._cursor).toEqual(0);
		expect(progress._bars).toEqual([]);
		expect(progress._terminates).toEqual(0);
	});

	it('can create new progress bar', () => {
		let bar = {};
		progress._getProgressBar = jest.fn().mockReturnValue(bar);
		progress._move = jest.fn();
		progress._updateTickMethod = jest.fn();
		progress._addCustomMethods = jest.fn();
		let length = 10;

		let newBar = progress.newBar(length);

		expect(bar).toEqual(newBar);
		expect(progress._getProgressBar).toHaveBeenCalledWith(length);
		expect(progress._move).toHaveBeenCalledWith(0);
		expect(process.stderr.write).toHaveBeenCalledWith('\n');
		expect(progress._updateTickMethod).toHaveBeenCalledWith(bar, 0);
		expect(progress._addCustomMethods).toHaveBeenCalledWith(bar);
		expect(progress._bars).toEqual([bar]);
	});

	it('can add custom methods', () => {
		let bar = {};

		progress._addCustomMethods(bar);

		expect(bar.updateLength).toEqual(jasmine.any(Function));
		expect(bar.reset).toEqual(jasmine.any(Function));
		expect(bar.getCurrent).toEqual(jasmine.any(Function));
		expect(bar.terminate).toEqual(jasmine.any(Function));
		expect(bar.untick).toEqual(jasmine.any(Function));
	});

	it('can terminate all progress bars', () => {
		progress._bars = ['bar'];
		progress._move = jest.fn();

		progress.terminate();

		expect(progress._move).toHaveBeenCalledWith(1);
		expect(process.stderr.clearLine).toHaveBeenCalledTimes(1);
		expect(process.stderr.cursorTo).toHaveBeenCalledWith(0);
	});

	it('can move cursor to bar at defined index', () => {
		progress._move(1);

		expect(process.stderr.moveCursor).toHaveBeenCalledWith(0, 1);
		expect(progress._cursor).toEqual(1);
	});

	it('can update tick method', () => {
		let tick = function(){};
		let bar = { tick };

		progress._updateTickMethod(bar, 0);

		expect(bar.otick).toEqual(tick);
		expect(bar.tick).not.toEqual(tick);
		expect(bar.tick).toEqual(jasmine.any(Function));
	});
});
