import Config from '../Config';

describe('Config', () => {
    it('can be loaded when no user configuration passed', () => {
        expect(Config.load()).toEqual(expect.any(Object));
    });

    it('can merge default config with user config', () => {
        const files = ['file1', 'file2'];

        expect(Config.load({ files }).files).toEqual(files);
    });

    it.each([
        ['http://www.example.com/index.html', 'http://www.example.com', '/index.html'],
        ['https://www.example.com/index.html', 'https://www.example.com', '/index.html'],
        ['https://www.example.com/', 'https://www.example.com', '/'],
        ['https://www.example.com/one/two/three.html', 'https://www.example.com', '/one/two/three.html'],
    ])(`can resolve url config for %s`, (originalUrl, parsedUrl, parsedUrlPath) => {
        const config = Config.load({ url: originalUrl });

        expect(config.url).toEqual(parsedUrl);
        expect(config.urlPaths).toEqual([parsedUrlPath]);
    });

    it('can set preview mode settings', () => {
        const config = Config.load({ previewMode: true });

        expect(config.parallelInstances).toEqual(1);
        expect(config.randomScenariosDisabled).toEqual(true);
        expect(config.minifyUserDefinedScenarios).toEqual(false);
        expect(config.headlessModeDisabled).toEqual(true);
    });
});
