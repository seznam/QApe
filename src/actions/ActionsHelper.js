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
		let executionContext = await element.executionContext();

		return executionContext.evaluate(input => {
			function isVisible(el, t, r, b, l, w, h) {
				var p = el.parentNode,
						VISIBLE_PADDING = 2;

				if ( !_elementInDocument(el) ) {
					return false;
				}

				//-- Return true for document node
				if ( 9 === p.nodeType ) {
					return true;
				}

				//-- Return false if our element is invisible
				if (
					 '0' === _getStyle(el, 'opacity') ||
					 'none' === _getStyle(el, 'display') ||
					 'hidden' === _getStyle(el, 'visibility')
				) {
					return false;
				}

				if (
					'undefined' === typeof(t) ||
					'undefined' === typeof(r) ||
					'undefined' === typeof(b) ||
					'undefined' === typeof(l) ||
					'undefined' === typeof(w) ||
					'undefined' === typeof(h)
				) {
					t = el.offsetTop;
					l = el.offsetLeft;
					b = t + el.offsetHeight;
					r = l + el.offsetWidth;
					w = el.offsetWidth;
					h = el.offsetHeight;
				}
				//-- If we have a parent, let's continue:
				if ( p ) {
					//-- Check if the parent can hide its children.
					if ( ('hidden' === _getStyle(p, 'overflow') || 'scroll' === _getStyle(p, 'overflow')) ) {
						//-- Only check if the offset is different for the parent
						if (
							//-- If the target element is to the right of the parent elm
							l + VISIBLE_PADDING > p.offsetWidth + p.scrollLeft ||
							//-- If the target element is to the left of the parent elm
							l + w - VISIBLE_PADDING < p.scrollLeft ||
							//-- If the target element is under the parent elm
							t + VISIBLE_PADDING > p.offsetHeight + p.scrollTop ||
							//-- If the target element is above the parent elm
							t + h - VISIBLE_PADDING < p.scrollTop
						) {
							//-- Our target element is out of bounds:
							return false;
						}
					}
					//-- Add the offset parent's left/top coords to our element's offset:
					if ( el.offsetParent === p ) {
						l += p.offsetLeft;
						t += p.offsetTop;
					}
					//-- Let's recursively check upwards:
					return isVisible(p, t, r, b, l, w, h);
				}
				return true;
			}

			//-- Cross browser method to get style properties:
			function _getStyle(el, property) {
				if ( window.getComputedStyle ) {
					return document.defaultView.getComputedStyle(el,null)[property];
				}
				if ( el.currentStyle ) {
					return el.currentStyle[property];
				}
			}

			function _elementInDocument(element) {
				while (element = element.parentNode) {
					if (element == document) {
							return true;
					}
				}
				return false;
			}

			let style = window.getComputedStyle(input, null);

			return isVisible(input) && style.width > 0 && style.height > 0;
		}, element);
	}
}
