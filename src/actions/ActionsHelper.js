export default class ActionsHelper {
	constructor(config) {
		this._config = config;
	}

	async getElementSelector(element) {
		let executionContext = await element.executionContext();

		return executionContext.evaluate(input => {
			function getPathTo(element) {
				if (element === document.body) {
					return '//' + element.tagName.toLowerCase();
				}

				if (!element.parentNode) {
					return '';
				}

				var siblings = element.parentNode.childNodes;
				var index = 0;

				for (var i= 0; i < siblings.length; i++) {
					var sibling = siblings[i];

					if (sibling === element) {
						return getPathTo(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (index + 1) + ']';
					}

					if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
						index++;
					}
				}
			}

			return getPathTo(input);
		}, element);
	}

	async isElementVisible(element) {
		return !!(await element.boundingBox());
	}
}
