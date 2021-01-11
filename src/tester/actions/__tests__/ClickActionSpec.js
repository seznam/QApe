import ClickAction from '../ClickAction';

describe('ClickAction', () => {
    let clickAction = null;

    beforeEach(() => {
        clickAction = new ClickAction({}, {});
    });

    it('can be initialized', () => {
        expect(clickAction._config).toEqual({});
    });

    it('can check if a click action is available', () => {
        expect(ClickAction.isActionAvailable()).toEqual(true);
    });

    it('can perform the click action', async () => {
        let page = {};
        let element = {
            hover: jest.fn().mockReturnValue(Promise.resolve()),
            click: jest.fn().mockReturnValue(Promise.resolve()),
        };

        await clickAction.action(element, page);

        expect(element.hover).toHaveBeenCalledTimes(1);
        expect(element.click).toHaveBeenCalledTimes(1);
    });

    it('can click on a specified element in preview mode', async () => {
        let page = {
            waitFor: jest.fn(),
        };
        let element = {
            hover: jest.fn().mockReturnValue(Promise.resolve()),
            click: jest.fn().mockReturnValue(Promise.resolve()),
        };
        clickAction._config = {
            headlessModeDisabled: true,
            previewModePauseTime: 99,
        };
        clickAction._actionsHelper.highlightElement = jest.fn().mockReturnValue(Promise.resolve());

        await clickAction.action(element, page);

        expect(element.hover).toHaveBeenCalledTimes(1);
        expect(clickAction._actionsHelper.highlightElement).toHaveBeenCalledWith(element);
        expect(page.waitFor).toHaveBeenCalledWith(99);
        expect(element.click).toHaveBeenCalledTimes(1);
    });

    it('can update action results', async () => {
        let results = {
            html: '<a>a</a>',
            config: {
                selector: 'a',
            },
        };
        let updatedResults = await clickAction.updateResults(results);

        expect(updatedResults.message).toEqual(jasmine.any(String));
        expect(updatedResults.html).toEqual(results.html);
        expect(updatedResults.config).toEqual(results.config);
    });
});
