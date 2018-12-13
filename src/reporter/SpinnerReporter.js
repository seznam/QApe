import EventEmitter from 'events';
import { cursorTo, clearLine } from 'readline';

const spinner = [
	"[    ]",
	"[=   ]",
	"[==  ]",
	"[=== ]",
	"[ ===]",
	"[  ==]",
	"[   =]"
];

/**
 * Default reporter
 * @extends EventEmitter
 */
export default class SpinnerReporter extends EventEmitter {
	/**
	 * @param {Object} config
	 * @param {Object} stdout
	 */
	constructor(config, stdout) {
		super();

		this._config = config;

		this._stdout = stdout || process.stdout;

		this._index = 0;

		if (!this._stdout.isTTY) {
			return;
		}

		this.on('runner:start', () => this._handleEvent());
		this.on('scenario:start', () => this._handleEvent());
		this.on('action:start', () => this._handleEvent());
		this.on('scenario:end', () => this._handleEvent());
		this.on('runner:end', () => this._handleRunnerEnd());
	}

	/**
	 * Handler for events which should cause a spin
	 */
	_handleEvent() {
		this._clearSpinner();
		this._stdout.write(spinner[this._index]);
		cursorTo(this._stdout, 0, this._stdout.rows - 1);

		this._index++;

		if (this._index >= spinner.length) {
			this._index = 0;
		}
	}

	_handleRunnerEnd() {
		this._clearSpinner();
	}

	_clearSpinner() {
		cursorTo(this._stdout, 0, this._stdout.rows);
		clearLine(this._stdout, 0);
	}
}
