import qapeExports from '../exports';

describe('Exports', () => {
    it('are all available', () => {
        expect(qapeExports).toMatchSnapshot();
    });
});
