import Config from '../Config';

describe('Config', () => {
    it('can be loaded when no user configuration passed', () => {
        expect(Config.load()).toEqual(jasmine.any(Object));
    });

    it('can merge default config with user config', () => {
        const files = ['file1', 'file2'];

        expect(Config.load({ files }).files).toEqual(files);
    });

    for (const protocol of ['http', 'https']) {
        it(`can resolve url config with ${protocol} protocol`, () => {
            const config = Config.load({ url: `${protocol}://www.example.com/index.html` });

            expect(config.url).toEqual(`${protocol}://www.example.com`);
            expect(config.urlPaths).toEqual(['/index.html']);
        });
    }

    it('can set preview mode settings', () => {
        const config = Config.load({ previewMode: true });

        expect(config.parallelInstances).toEqual(1);
        expect(config.randomScenariosDisabled).toEqual(true);
        expect(config.minifyUserDefinedScenarios).toEqual(false);
        expect(config.headlessModeDisabled).toEqual(true);
    });
});
