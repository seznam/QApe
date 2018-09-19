function getRandomElementFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function sumPartialSeries(number) {
	return (number * (number + 1)) / 2;
}

function formatDigits(number, digits = 2) {
	return String(number).padStart(digits, '0');
}

export {
	getRandomElementFromArray,
	sumPartialSeries,
	formatDigits
}
