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
export async function runTests(testDirectory, returnResults = false, codiConfig = {}) {
    state.resetCounters();
    state.startTimer();

    let testFiles = fs.readdirSync(testDirectory, { recursive: true })
        .filter(file => file.endsWith('.mjs'));

    if (codiConfig.excludeDirectories) {
        const matcher = excludePattern(codiConfig.excludeDirectories);
        testFiles = testFiles.filter(file => !matcher(file));
    }

    console.log(chalk.bold.magenta(`\nRunning tests in directory: ${chalk.underline(testDirectory)}`));
    console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));

    for (const file of testFiles) {
        await runTestFile(path.join(testDirectory, file));
    }

    const summary = {
        passedTests: state.passedTests,
        failedTests: state.failedTests,
        testResults: state.testResults,
        executionTime: state.getExecutionTime()
    };

    console.log(chalk.bold.cyan('\nTest Summary:'));
    console.log(chalk.green(`  Passed: ${summary.passedTests}`));
    console.log(chalk.red(`  Failed: ${summary.failedTests}`));
    console.log(chalk.blue(`  Time: ${summary.executionTime}s`));

    if (returnResults) return summary;

    if (state.failedTests > 0) {
        console.log(chalk.red('\nSome tests failed.'));
        process.exit(1);
    } else {
        console.log(chalk.green('\nAll tests passed.'));
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
export async function runTestFunction(testFn) {
    const suite = {
        description: `Function: ${testFn.name}`,
        tests: [],
        startTime: performance.now()
    };

    state.pushSuite(suite);

    try {
        await Promise.resolve(testFn());
    } catch (error) {
        console.error(`Error in test ${testFn.name}:`, error);
        state.failedTests++;
    } finally {
        suite.duration = performance.now() - suite.startTime;
        state.testResults.push(suite);
        state.popSuite();
    }

    return {
        passedTests: state.passedTests,
        failedTests: state.failedTests,
        testResults: state.testResults
    };
}