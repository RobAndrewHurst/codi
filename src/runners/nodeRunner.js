import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { state } from '../state/TestState.js';
import { excludePattern } from '../util/regex.js';

/**
 * Run a single test file
 * @async
 * @function runTestFile
 * @param {string} testFile - Path to test file
 * @returns {Promise<void>}
 */
async function runTestFile(testFile) {
    try {
        const fileUrl = path.isAbsolute(testFile)
            ? `file://${testFile}`
            : `file://${path.resolve(testFile)}`;

        await import(fileUrl);
    } catch (error) {
        console.error(chalk.red(`\nError running test file ${chalk.underline(testFile)}:`));
        console.error(chalk.red(error.stack));
        state.failedTests++;
    }
}

/**
 * Run tests in a directory
 * @async
 * @function runTests
 * @param {string} testDirectory - Directory containing tests
 * @param {boolean} [returnResults=false] - Whether to return results
 * @param {object} [codiConfig={}] - Configuration object
 * @returns {Promise<object|void>} Test results if returnResults is true
 */
export async function runTests(testDirectory, returnResults = false, codiConfig = {}, options = {}) {
    state.resetCounters();
    state.startTimer();
    state.setOptions(options);

    let testFiles = fs.readdirSync(testDirectory, { recursive: true })
        .filter(file => file.endsWith('.mjs'));

    if (codiConfig.excludeDirectories) {
        const matcher = excludePattern(codiConfig.excludeDirectories);
        testFiles = testFiles.filter(file => !matcher(file));
    }

    if (!options.quiet) {
        console.log(chalk.bold.magenta(`\nRunning tests in directory: ${chalk.underline(testDirectory)}`));
        console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));
    }

    for (const file of testFiles) {
        await runTestFile(path.join(testDirectory, file));
    }

    state.printSummary();

    if (returnResults) {
        return {
            passedTests: state.passedTests,
            failedTests: state.failedTests,
            testResults: state.testResults,
            executionTime: state.getExecutionTime()
        };
    }

    if (state.failedTests > 0) {
        console.log(chalk.red(`\n${state.failedTests} tests failed.`));
        process.exit(1);
    } else {
        console.log(chalk.green(`\n${state.passedTests} tests passed.`));
        process.exit(0);
    }
}

/**
 * Run a single test function
 * @async
 * @function runTestFunction
 * @param {Function} testFn - Test function to run
 * @returns {Promise<object>} Test results
 */
export async function runTestFunction(testFn, options, description) {
    const suite = {
        description: description ? description : `Function: ${testFn.name}`,
        tests: [],
        startTime: performance.now()
    };

    state.pushSuite(suite);

    if (options) {
        state.setOptions(options);
    }

    try {
        await Promise.resolve(testFn(suite.description));
    } catch (error) {
        console.error(`Error in test ${testFn.name}:`, error);
        state.failedTests++;
    } finally {
        suite.duration = performance.now() - suite.startTime;
        state.testResults.push(suite);
        state.popSuite();
    }

    if (options.showSummary) {
        state.printSummary();
    }

    return {
        passedTests: state.passedTests,
        failedTests: state.failedTests,
        testResults: state.testResults
    };
}