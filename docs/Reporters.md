# Reporters
You can define reporters via config.reporters.

```
var ExampleReporter = require('/path/to/ExampleReporter');

export default {
	reporters: [
		// For reporter published in npm registry as 'qape-reporter-example'
		'example',
		// ExampleReporter is Class extending EventEmitter
		ExampleReporter
	]
}
```

## Usage
This is how you can create your own custom reporter. See [console reporter](../src/reporter/ConsoleReporter.js), [file reporter](../src/reporter/FileReporter.js), or [spinner reporter](../src/reporter/SpinnerReporter.js) for extended examples.

```javascript
import EventEmitter from 'events';

export default class DefaultReporter extends EventEmitter {
	constructor(config) {
		super();

		// You will recieve configuration for current QApe run
		this._config = config;

		// runner:start is emitted after browser instance is initialized
		// eventData contains scenario and browser instance
		this.on('runner:start', eventData => console.log(eventData));
		// scenario:start is emitted after specific scenario starts
		// eventData contains browser instance, scenario type
		// For type 'defined' there is also scenario and name
		// For type 'failing' there is also scenario and errors
		this.on('scenario:start', eventData => console.log(eventData));
		// action:start is emitted after specific action starts
		// eventData contains instance and action
		this.on('action:start', eventData => console.log(eventData));
		// action:error is emitted after specific action receives an execution error (i.e. by clicking unclickable element)
		// eventData contains instance, action and error
		this.on('action:error', eventData => console.log(eventData));
		// action:end is emitted after specific action ends
		// eventData contains instance, action and results
		this.on('action:end', eventData => console.log(eventData));
		// scenario:end is emitted after specific scenario is finished
		// eventData contains browser instance, scenario type
		// For type 'defined' there is also scenario, name and results
		// For type 'failing' there is also scenario, errors and minified (boolean)
		// For type 'random' there is also results
		this.on('scenario:end', eventData => console.log(eventData));
		// runner:end is emitted after browser instance is cleared
		this.on('runner:end', () => console.log('it\'s done'));
		// runner:error is emitted whenever an uncaught error occurred
		// eventData contains scenario, browser instance and error
		this.on('runner:error', eventData => console.log(eventData));
	}
}
```
