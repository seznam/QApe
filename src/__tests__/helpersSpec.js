import { formatDigits } from '../helpers'

describe('Helpers', () => {
	describe('formatDigits', () => {
		it('can format digits', () => {
			expect(formatDigits(1)).toEqual('01');
			expect(formatDigits(1, 4)).toEqual('0001');
			expect(formatDigits(44, 4)).toEqual('0044');
		});
	});
});
