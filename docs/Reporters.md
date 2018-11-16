# Reporters
You can define reporters via config.reporters.

```
var LocalCool = require('/path/to/LocalCool');

export default {
	reporters: [
		// For reporter published in npm registry as 'qape-reporter-cool'
		'cool',
		// LocalCool is Class extending EventEmitter
		LocalCool
	]
}
```

## Usage
This is how you can create your own custom reporter. See [default reporter](../src/reporter/DefaultReporter.js) for extended example.

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
		// scenarios:start is emitted after specific scenario starts
		// eventData contains browser instance, scenario type
		// For type 'defined' there is also scenario and name
		// For type 'failing' there is also scenario and errors
		this.on('scenario:start', eventData => console.log(eventData));
		// scenarios:end is emitted after specific scenario is finished
		// eventData contains browser instance, scenario type
		// For type 'defined' there is also scenario, name and results
		// For type 'failing' there is also scenario, errors and minified (boolean)
		// For type 'random' there is also results
		this.on('scenario:end', eventData => console.log(eventData));
		// runner:end is emitted after browser instance is cleared
		this.on('runner:end', () => console.log('it\'s done'));
		// runner:error is emitted whenever an uncaught error occurred
		// eventData contains scenario, and browser instance and error
		this.on('runner:error', eventData => console.log(eventData));
	}
}
```
