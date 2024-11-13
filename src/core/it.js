import chalk from 'chalk';
import { state } from '../state/TestState.js';

/**
 * Create a test case
 * @async
 * @function it
 * @param {string} description - Test case description
 * @param {Function} callback - Test callback function
 * @returns {Promise<void>}
 * @throws {Error} If called outside a describe block
 */
export async function it(description, callback, suiteDescription) {
    // Find the suite by its description
    const suite = state.suiteStack.find(s => s.description === suiteDescription);

    if (!suite) {
        throw new Error(`Cannot find test suite with description: ${suiteDescription}`);
    }

    const test = {
        description,
        startTime: performance.now()
    };

    try {
        await Promise.resolve(callback());
        test.status = 'passed';
        test.duration = performance.now() - test.startTime;
        state.passedTests++;
    } catch (error) {
        test.status = 'failed';
        test.error = error;
        test.duration = performance.now() - test.startTime;
        state.failedTests++;
    }

    // Add the test to the correct suite
    suite.tests.push(test);
}