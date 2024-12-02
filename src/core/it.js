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
export async function it(params, callback) {

    const suite = state.getSuite(params)

    if (!suite) {
        throw new Error('A test needs to belong to a suite');
    }

    const test = {
        description: params.description,
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

    state.addTestToSuite(suite, test);
}
