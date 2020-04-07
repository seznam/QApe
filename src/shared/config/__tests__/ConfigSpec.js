import Config from '../Config';

describe('Config', () => {
    it('can be loaded when no user configuration passed', () => {
        expect(Config.load()).toEqual(jasmine.any(Object));
    });

    it('can merge default config with user config', () => {
        let files = ['file1', 'file2'];

        expect(Config.load({ files }).files).toEqual(files);
    });

    it('can set preview mode settings', () => {
        let config = Config.load({ previewMode: true });

        expect(config.parallelInstances).toEqual(1);
        expect(config.randomScenariosDisabled).toEqual(true);
        expect(config.minifyUserDefinedScenarios).toEqual(false);
        expect(config.headlessModeDisabled).toEqual(true);
    });
});
