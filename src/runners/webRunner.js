import { state } from '../state/TestState.js';
import chalk from 'chalk';
import { runTestFunction } from './nodeRunner.js';

/**
 * Run a web test file
 * @async
 * @function runWebTestFile
 * @param {string} testFile - Path to test file
 * @param {object} [options={}] - Options for running the test
 * @returns {Promise<void>}
 */
export async function runWebTestFile(testFile, options) {

    const defaults = {
        silent: false
    };

    options ??= defaults;

    try {

        const testPromise = import(testFile);
        await Promise.resolve(testPromise);

    } catch (error) {
        console.error(`Error running test file ${testFile}:`);
        console.error(error.stack);
        state.failedTests++;
    }
}

/**
 * Run web tests
 * @async
 * @function runWebTests
 * @param {string[]} testFiles - Array of test files
 * @param {object} [options={}] - Options for running the tests
 * @returns {Promise<object>} Test results
 */
export async function runWebTests(testFiles, options) {

    const defaults = {
        quiet: false,
        showSummary: true
    }

    options ??= defaults;

    state.resetCounters();
    state.startTimer();

    if (!options.quiet) {
        console.log(chalk.bold.magenta(`\nRunning ${testFiles.length} web test file(s)`));
    }

    try {
        for (const file of testFiles) {
            await runWebTestFile(file, options);
        }
    } catch (error) {
        console.error(chalk.red('\nTest execution failed:'));
        console.error(chalk.red(error.stack));
    }

    const summary = {
        totalTests: state.passedTests + state.failedTests,
        passedTests: state.passedTests,
        failedTests: state.failedTests,
        executionTime: state.getExecutionTime(),
        testResults: state.testResults
    };

    if (options.showSummary) {
        state.printSummary();
    }

    return summary;
}

/**
 * Run a single test function
 * @async
 * @function runTestFunction
 * @param {Function} testFn - Test function to run
 * @returns {Promise<object>} Test results
 */
export async function runWebTestFunction(testFn, options) {

    options ??= {
        quiet: false,
        showSummary: true
    }

    state.setOptions(options);

    await runTestFunction(testFn);

    if (options.showSummary) {
        state.printSummary();
    }

    return {
        passedTests: state.passedTests,
        failedTests: state.failedTests,
        testResults: state.testResults
    };
}