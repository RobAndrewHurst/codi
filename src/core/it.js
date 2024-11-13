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
export async function it(description, callback) {
    if (!state.currentSuite) {
        throw new Error('Test case defined outside of describe block');
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

    state.currentSuite.tests.push(test);
}