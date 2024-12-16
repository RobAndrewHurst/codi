import { state } from '../state/TestState.js';

/**
 * Create a test case
 * @async
 * @function it
 * @param {string} name - Test case name
 * @param {Function} callback - Test callback function
 * @returns {Promise<void>}
 * @throws {Error} If called outside a describe block
 */
export async function it(params, callback) {
    const suite = state.getSuite(params.parentId);

    if (!suite) {
        throw new Error(`test: ${params.name} needs to belong to a suite`);
    }

    const test = {
        name: params.name,
        startTime: performance.now()
    };

    const testPromise = (async () => {
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
        } finally {
            state.addTestToSuite(suite, test);
        }
    })();

    state.testTracker.addTest(testPromise);
    return testPromise;
}