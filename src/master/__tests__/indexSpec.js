import master from '../index';

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalProcessExit = process.exit;

describe('Master', () => {
	let cluster = null;
	let workers = null;

	beforeEach(() => {
		console.log = jest.fn();
		console.error = jest.fn();
		process.exit = jest.fn();
		workers = [];
		cluster = {
			fork: jest.fn(env => {
				let onFunctions = {};
				let worker = {
					on: jest.fn((name, fn) => {
						onFunctions[name] = fn;

						return worker;
					}),
					send: jest.fn(),
					onFunctions,
					env,
					id: workers.length
				};

				workers.push(worker);

				return worker;
			}),
			workers
		};
		master(cluster, { testerTimeout: 5000, parallelInstances: 1 });
	});

	afterEach(() => {
		console.log = originalConsoleLog;
		console.error = originalConsoleError;
		process.exit = originalProcessExit;
	});

	it('can be initialized', () => {
		expect(cluster.fork).toHaveBeenCalledTimes(3);
	});

	it('can handle exit of the reporter', () => {
		cluster.fork.mockClear();
		let reporter = workers
			.find(worker => (worker.env && worker.env.worker_type === 'reporter'));

		reporter.onFunctions.exit(0);

		expect(console.error).toHaveBeenCalledWith(jasmine.any(String));
		expect(cluster.fork).toHaveBeenCalledWith({ worker_type: 'reporter' });
	});

	it('can handle exit of the scriptwriter', () => {
		cluster.fork.mockClear();
		let scriptwriter = workers
			.find(worker => (worker.env && worker.env.worker_type === 'scriptwriter'));

		scriptwriter.onFunctions.exit(0);

		expect(console.error).toHaveBeenCalledWith(jasmine.any(String));
		expect(cluster.fork).toHaveBeenCalledWith({ worker_type: 'scriptwriter' });
	});

	it('can handle message from the scriptwriter', () => {
		let scriptwriter = workers
			.find(worker => (worker.env && worker.env.worker_type === 'scriptwriter'));
		let msg = {
			reciever: 'tester',
			workerId: 2,
			eventData: 'eventData'
		};
		scriptwriter.onFunctions.message(msg);

		expect(workers[2].send).toHaveBeenCalledWith('eventData');
	});

	it('can handle message from a tester to the reporter', () => {
		let reporter = workers
			.find(worker => (worker.env && worker.env.worker_type === 'reporter'));
		let tester = workers.find(worker => (!worker.env));
		let msg = { reciever: 'reporter' };

		tester.onFunctions.message(msg);

		expect(reporter.send).toHaveBeenCalledWith({
			reciever: 'reporter',
			workerId: tester.id
		});
	});

	it('can handle message from a tester to the scriptwriter', () => {
		let scriptwriter = workers
			.find(worker => (worker.env && worker.env.worker_type === 'scriptwriter'));
		let tester = workers.find(worker => (!worker.env));
		let msg = { reciever: 'scriptwriter' };

		tester.onFunctions.message(msg);

		expect(scriptwriter.send).toHaveBeenCalledWith({
			reciever: 'scriptwriter',
			workerId: tester.id
		});
	});

	it('can handle exit of a tester, when it was killed due to an inactivity', () => {
		cluster.fork.mockClear();
		let tester = workers.find(worker => (!worker.env));

		tester.onFunctions.exit(null, 'SIGKILL');

		expect(console.log).toHaveBeenCalledWith(jasmine.any(String));
		expect(cluster.fork).toHaveBeenCalledTimes(1);
	});

	it('can handle exit of a tester for a successful run', () => {
		let tester = workers.find(worker => (!worker.env));

		tester.onFunctions.exit(0);

		expect(console.log).toHaveBeenCalledWith(jasmine.any(String));
		expect(process.exit).toHaveBeenCalledWith(0);
	});

	it('can handle exit of a tester for a unsuccessful run', () => {
		let tester = workers.find(worker => (!worker.env));

		tester.onFunctions.exit(1);

		expect(console.log).toHaveBeenCalledWith(jasmine.any(String));
		expect(process.exit).toHaveBeenCalledWith(1);
	});
});
