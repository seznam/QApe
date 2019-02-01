/** @module helpers */

/**
 * Gets a random element from the array
 * @memberof helpers
 * @param {Array} array
 * @returns {*} Element from the array
 */
function getRandomElementFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Formats number to specified number of digits
 * @memberof helpers
 * @param {number} number
 * @param {number} [digits=2]
 * @returns {string} Number prefixed with ${digits} of zeros
 */
function formatDigits(number, digits = 2) {
	return String(number).padStart(digits, '0');
}

export {
	getRandomElementFromArray,
	formatDigits
}
