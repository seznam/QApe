import {
	sumPartialSeries,
	formatDigits
} from '../helpers'

describe('Helpers', () => {
	describe('sumPartialSeries', () => {
		it('can sum partial series', () => {
			expect(sumPartialSeries(1)).toEqual(1);
			expect(sumPartialSeries(2)).toEqual(3);
			expect(sumPartialSeries(3)).toEqual(6);
			expect(sumPartialSeries(4)).toEqual(10);
			expect(sumPartialSeries(5)).toEqual(15);
		});
	});

	describe('formatDigits', () => {
		it('can format digits', () => {
			expect(formatDigits(1)).toEqual('01');
			expect(formatDigits(1, 4)).toEqual('0001');
			expect(formatDigits(44, 4)).toEqual('0044');
		});
	});
});
