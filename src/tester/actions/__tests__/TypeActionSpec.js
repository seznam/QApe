import TypeAction from '../TypeAction';

describe('TypeAction', () => {
    let typeAction = null;

    beforeEach(() => {
        typeAction = new TypeAction({}, {});
    });

    it('can be initialized', () => {
        expect(typeAction._config).toEqual({});
    });

    it('can check if a type action is available', () => {
        let context = {
            evaluate: jest.fn((fn) => fn(element)),
        };
        let executionContext = jest.fn().mockReturnValue(context);
        let element = {
            executionContext,
            matches: jest.fn().mockReturnValue(true),
        };

        expect(TypeAction.isActionAvailable(element)).toEqual(true);
        expect(element.executionContext).toHaveBeenCalledTimes(1);
        expect(context.evaluate).toHaveBeenCalledWith(expect.any(Function), element);
        expect(element.matches).toHaveBeenCalledWith(expect.any(String));
    });

    it('can perform the type action', async () => {
        let page = {};
        let element = {
            hover: jest.fn().mockReturnValue(Promise.resolve()),
            type: jest.fn().mockReturnValue(Promise.resolve()),
        };
        typeAction._getText = jest.fn().mockReturnValue('text');
        typeAction._config = {
            typeActionDelay: 50,
        };

        await typeAction.action(element, page);

        expect(typeAction._getText).toHaveBeenCalled();
        expect(element.hover).toHaveBeenCalledTimes(1);
        expect(element.type).toHaveBeenCalledWith('text', { delay: typeAction._config.typeActionDelay });
    });

    it('can perform the type action in preview mode', async () => {
        let page = {
            waitForTimeout: jest.fn(),
        };
        let element = {
            hover: jest.fn().mockReturnValue(Promise.resolve()),
            type: jest.fn().mockReturnValue(Promise.resolve()),
        };
        typeAction._config = {
            headlessModeDisabled: true,
            previewModePauseTime: 99,
            typeActionDelay: 50,
        };
        typeAction._actionsHelper.highlightElement = jest.fn().mockReturnValue(Promise.resolve());
        typeAction._getText = jest.fn().mockReturnValue('text');

        await typeAction.action(element, page);

        expect(typeAction._getText).toHaveBeenCalled();
        expect(element.hover).toHaveBeenCalledTimes(1);
        expect(typeAction._actionsHelper.highlightElement).toHaveBeenCalledWith(element);
        expect(page.waitForTimeout).toHaveBeenCalledWith(99);
        expect(element.type).toHaveBeenCalledWith('text', { delay: typeAction._config.typeActionDelay });
    });

    it('can get text from config', () => {
        typeAction._actionConfig = {
            text: 'text',
        };

        expect(typeAction._getText()).toEqual('text');
    });

    it('can generate random text from faker', () => {
        typeAction._config = {
            typeActionTextTypes: ['name.firstName'],
        };

        expect(typeAction._getText()).toEqual(expect.any(String));
    });

    it('can update action results', async () => {
        typeAction._text = 'text';
        let results = {
            html: '<a>a</a>',
            config: {
                selector: 'a',
            },
        };
        let updatedResults = await typeAction.updateResults(results);

        expect(updatedResults.message).toEqual(expect.any(String));
        expect(updatedResults.html).toEqual(results.html);
        expect(updatedResults.config.selector).toEqual(results.config.selector);
        expect(updatedResults.config.text).toEqual(expect.any(String));
    });
});
