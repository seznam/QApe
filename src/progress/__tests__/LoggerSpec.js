import Logger from '../Logger';

describe('Logger', () => {
	let consoleLog = console.log;

	beforeEach(() => {
		console.log = jest.fn();
	});

	afterEach(() => {
		console.log = consoleLog;
	});

	it('can log info when tick is called', () => {
		let info = 'info';

		Logger.tick({ info });

		expect(console.log).toHaveBeenCalledWith(info);
	});

	it('has method reset defined', () => {
		expect(Logger.reset).toEqual(jasmine.any(Function));
	});

	it('has method updateLength defined', () => {
		expect(Logger.updateLength).toEqual(jasmine.any(Function));
	});
});
