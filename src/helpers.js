function getRandomElementFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function formatDigits(number, digits = 2) {
	return String(number).padStart(digits, '0');
}

export {
	getRandomElementFromArray,
	formatDigits
}
