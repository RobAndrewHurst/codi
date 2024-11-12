import chalk from 'chalk';
import { state } from '../state/TestState.js';

/**
 * Create a test suite
 * @async
 * @function describe
 * @param {string} description - Description of the test suite
 * @param {Function} callback - Suite callback function
 * @returns {Promise<void>}
 */
export async function describe(description, callback) {
    const suite = {
        description,
        tests: [],
        startTime: performance.now()
    };

    state.pushSuite(suite);
    if (!state.options?.quiet) {
        console.log(chalk.bold.cyan(`\n${description}`));
    }

    try {
        await Promise.resolve(callback());
    } catch (error) {
        console.error(chalk.red(`Suite failed: ${description}`));
        console.error(chalk.red(error.stack));
    } finally {
        suite.duration = performance.now() - suite.startTime;
        state.testResults.push(suite);
        state.popSuite();
    }
}