export default class Logger {
	static tick(arg1, arg2) {
		let tick = arg1;
		let info = arg2;

		if (typeof tick === 'object') {
			info = tick;
		}

		if (typeof info === 'object' && info.info) {
			console.log(info.info);
		}
	}

	static reset() {}

	static updateLength() {}

	static getCurrent() {}

	static terminate() {}

	static untick() {}
}
