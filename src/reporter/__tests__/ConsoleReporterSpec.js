import Reporter from '../ConsoleReporter';

const consoleLogOrig = console.log;
const consoleErrorOrig = console.error;

describe('ConsoleReporter', () => {
	let reporter = null;

	beforeEach(() => {
		reporter = new Reporter({});
		console.log = jest.fn();
		console.error = jest.fn();
	});

	afterEach(() => {
		console.log = consoleLogOrig;
		console.error = consoleErrorOrig;
	});

	it('can be initialized', () => {
		expect(reporter._config).toEqual({});
	});

	it('can handle scenario:start event', () => {
		reporter.emit('scenario:start', { type: 'type' });

		expect(console.log)
			.toHaveBeenCalledWith('Starting', 'type', 'scenario...');
	});

	it('can handle defined scenario:end event', () => {
		let eventData = { type: 'defined' };
		reporter._handleDefinedScenarioEnd = jest.fn();

		reporter.emit('scenario:end', eventData);

		expect(reporter._handleDefinedScenarioEnd)
			.toHaveBeenCalledWith(eventData);
	});

	it('can handle failing scenario:end event', () => {
		let eventData = { type: 'failing' };
		reporter._handleFailingScenarioEnd = jest.fn();

		reporter.emit('scenario:end', eventData);

		expect(reporter._handleFailingScenarioEnd)
			.toHaveBeenCalledWith(eventData);
	});

	it('can handle random scenario:end event', () => {
		let eventData = { type: 'random' };
		reporter._handleRandomScenarioEnd = jest.fn();

		reporter.emit('scenario:end', eventData);

		expect(reporter._handleRandomScenarioEnd)
			.toHaveBeenCalledWith(eventData);
	});

	it('can handle a runner:error event', () => {
		let eventData = {
			error: {
				toString: () => 'error'
			}
		};

		reporter.emit('runner:error', eventData);

		expect(console.error).toHaveBeenCalledWith('error');
	});

	it('can handle defined scenario end for failure', () => {
		let eventData = {
			name: 'name',
			results: {
				scenario: 'scenario',
				errors: ['error']
			}
		};
		reporter._logConsole = jest.fn();

		reporter._handleDefinedScenarioEnd(eventData);

		expect(reporter._logConsole)
			.toHaveBeenCalledWith('✘ name', 'scenario', ['error']);
	});

	it('can handle defined scenario end for success', () => {
		let eventData = {
			name: 'name',
			results: {
				scenario: 'scenario',
				errors: []
			}
		};
		reporter._logConsole = jest.fn();

		reporter._handleDefinedScenarioEnd(eventData);

		expect(reporter._logConsole)
			.toHaveBeenCalledWith('✓ name', 'scenario', []);
	});

	it('can handle failing scenario end for minified scenario', () => {
		let eventData = {
			minified: true,
			scenario: 'scenario',
			errors: ['error']
		};
		reporter._logConsole = jest.fn();

		reporter._handleFailingScenarioEnd(eventData);

		expect(reporter._logConsole)
			.toHaveBeenCalledWith(
				jasmine.any(String),
				'scenario',
				['error']
			);
	});

	it('can handle failing scenario end for not reproduced scenario', () => {
		let eventData = {
			minified: false,
			scenario: 'scenario',
			errors: ['error']
		};
		reporter._logConsole = jest.fn();

		reporter._handleFailingScenarioEnd(eventData);

		expect(reporter._logConsole)
			.toHaveBeenCalledWith(
				jasmine.any(String),
				[],
				['error']
			);
	});

	it('can handle random scenario end with an error in results', () => {
		let eventData = {
			results: {
				errors: ['error']
			}
		};

		reporter._handleRandomScenarioEnd(eventData);

		expect(console.log).toHaveBeenCalledWith('Random scenario recieved following error.');
		expect(console.log).toHaveBeenCalledWith('error');
	});

	it('can handle random scenario end without an error in results', () => {
		let eventData = {
			results: {
				errors: []
			}
		};

		reporter._handleRandomScenarioEnd(eventData);

		expect(console.log).toHaveBeenCalledWith('Random scenario did not find any errors.');
	});

	it('can handle random scenario end with an execution error in results', () => {
		let eventData = {
			results: {
				executionError: 'executionError'
			}
		};

		reporter._handleRandomScenarioEnd(eventData);

		expect(console.log).toHaveBeenCalledWith('Random scenario recieved execution error.');
		expect(console.log).toHaveBeenCalledWith(eventData.results.executionError);
	});

	it('can log a scenario to console', () => {
		let text = 'text';
		let scenario = [{
			beforeLocation: 'beforeLocation',
			message: 'message'
		}];
		let errors = ['error'];

		reporter._logConsole(text, scenario, errors);

		expect(console.log).toHaveBeenCalledWith(text);
		expect(console.log).toHaveBeenCalledWith('StartLocation:', 'beforeLocation');
		expect(console.log).toHaveBeenCalledWith('message');
		expect(console.log).toHaveBeenCalledWith('error');
	});
});
