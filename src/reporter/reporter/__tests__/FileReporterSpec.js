jest.mock('fs');

import Reporter from '../FileReporter';
import path from 'path';
import fs from 'fs';

describe('FileReporter', () => {
    let reporter = null;

    beforeEach(() => {
        reporter = new Reporter({});
    });

    it('can be initialized', () => {
        expect(reporter._config).toEqual({});
        expect(reporter._results).toEqual([]);
    });

    it('can handle failing scenario:end event', () => {
        let eventData = { type: 'failing' };
        reporter._handleFailingScenarioEnd = jest.fn();

        reporter.emit('scenario:end', eventData);

        expect(reporter._handleFailingScenarioEnd).toHaveBeenCalledWith(eventData);
    });

    it('can handle failing not reproduced scenario end', () => {
        let eventData = {
            minified: false,
            scenario: 'scenario',
            errors: 'error',
        };
        reporter._isFailureReported = jest.fn().mockReturnValue(false);
        reporter._logFile = jest.fn();
        reporter._getScenarioName = jest.fn().mockReturnValue('name');

        reporter._handleFailingScenarioEnd(eventData);

        expect(reporter._isFailureReported).toHaveBeenCalledWith(eventData.scenario);
        expect(reporter._results).toEqual([
            {
                scenario: eventData.scenario,
                errors: eventData.errors,
            },
        ]);
        expect(reporter._getScenarioName).toHaveBeenCalledWith('-not-reproduced');
        expect(reporter._logFile).toHaveBeenCalledWith(eventData.scenario, eventData.errors, 'name');
    });

    it('can handle failing minified scenario end', () => {
        let eventData = {
            minified: true,
            scenario: 'scenario',
            errors: 'error',
        };
        reporter._isFailureReported = jest.fn().mockReturnValue(false);
        reporter._logFile = jest.fn();
        reporter._getScenarioName = jest.fn().mockReturnValue('name');

        reporter._handleFailingScenarioEnd(eventData);

        expect(reporter._isFailureReported).toHaveBeenCalledWith(eventData.scenario);
        expect(reporter._results).toEqual([
            {
                scenario: eventData.scenario,
                errors: eventData.errors,
            },
        ]);
        expect(reporter._getScenarioName).toHaveBeenCalledWith('-minified');
        expect(reporter._logFile).toHaveBeenCalledWith(eventData.scenario, eventData.errors, 'name');
    });

    it('can log results to file', () => {
        let scenario = 'scenario';
        let errors = 'errors';
        let config = {
            reportPath: 'path',
        };
        reporter._getScenarioName = jest.fn().mockReturnValue('name');
        reporter._config = config;
        fs.existsSync = jest.fn().mockReturnValue(false);
        fs.mkdirSync = jest.fn();
        fs.writeFileSync = jest.fn();

        reporter._logFile(scenario, errors);

        expect(reporter._getScenarioName).toHaveBeenCalled();
        expect(fs.existsSync).toHaveBeenCalledWith(config.reportPath);
        expect(fs.mkdirSync).toHaveBeenCalledWith(config.reportPath);
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(config.reportPath, 'name.json'));
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            path.join(config.reportPath, 'name.json'),
            JSON.stringify({ name: 'name', errors, scenario }, null, '\t')
        );
        fs.existsSync.mockRestore();
        fs.mkdirSync.mockRestore();
        fs.writeFileSync.mockRestore();
    });

    it('can get scenario name', () => {
        expect(reporter._getScenarioName()).toEqual(jasmine.any(String));
        expect(reporter._getScenarioName('.json')).toMatch(/\.json$/);
    });

    it('can check if failure is reported', () => {
        reporter._results = [
            {
                scenario: {
                    test: 'res1',
                },
            },
            {
                scenario: {
                    test: 'res2',
                },
            },
        ];

        expect(reporter._isFailureReported({ test: 'res1' })).toBe(true);
        expect(reporter._isFailureReported({ test: 'res3' })).toBe(false);
    });
});
