import ProgressBar from 'progress';
import Logger from './Logger';

export default class Progress {
	constructor(config) {
		this._config = config;

		this._cursor = 0;
		this._bars = [];
		this._terminates = 0;
	}

	newBar(length) {
		if (!process.stderr.isTTY) {
			return Logger;
		}

		let bar = new ProgressBar('[:bar] :current/:total :info', { total: length, width: 100 });
		this._bars.push(bar);
		let index = this._bars.length - 1;

		this._move(index);
		process.stderr.write('\n');
		this._cursor++;

		this._updateTickMethod(bar, index);
		this._addCustomMethods(bar);

		return bar;
	}

	_addCustomMethods(bar) {
		bar.updateLength = (length) => {
			bar.total = length;
		}

		bar.reset = (length) => {
			bar.curr = 0;

			if (length) {
				bar.updateLength(length);
			}
		}

		bar.getCurrent = () => bar.curr;
		bar.terminate = () => {};

		bar.untick = () => bar.curr--;
	}

	terminate() {
		this._move(this._bars.length);

		for (let i = 0; i < this._bars.length; i++) {
			process.stderr.clearLine();
			process.stderr.cursorTo(0);
		}
	}

	_move(index) {
		if (!process.stderr.isTTY) {
			return;
		}

		process.stderr.moveCursor(0, index - this._cursor);
		this._cursor = index;
	}

	_updateTickMethod(bar, index) {
		bar.otick = bar.tick;

		bar.tick = (value, options) => {
			this._move(index);
			bar.otick(value, options);
		}
	}
}
