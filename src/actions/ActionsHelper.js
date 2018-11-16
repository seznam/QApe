export default class ActionsHelper {
	constructor(config) {
		this._config = config;
	}

	async getElementSelector(input) {
		let executionContext = await input.executionContext();

		return executionContext.evaluate(input => {
			function getPathTo(element) {
				if (element === document.body) {
					return '//' + element.tagName.toLowerCase();
				}

				var ix = 0;
				var siblings;

				if (!element.parentNode) {
					return '';
				}

				siblings = element.parentNode.childNodes;

				for (var i= 0; i < siblings.length; i++) {
					var sibling = siblings[i];

					if (sibling === element) {
						return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
					}

					if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
						ix++;
					}
				}
			}

			return getPathTo(input);
		}, input);
	}

	async isElementVisible(element) {
		return !!(await element.boundingBox());
	}
}
