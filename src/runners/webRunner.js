import { state } from '../state/TestState.js';
import chalk from 'chalk';

/**
 * Run a web test file
 * @async
 * @function runWebTestFile
 * @param {string} testFile - Path to test file
 * @param {object} [options={}] - Options for running the test
 * @returns {Promise<void>}
 */
export async function runWebTestFile(testFile, options = {}) {
    const {
        timeout = 5000,
        silent = false
    } = options;

    try {
        const startTime = performance.now();

        const testPromise = import(testFile);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Test file ${testFile} timed out after ${timeout}ms`)), timeout);
        });

        await Promise.race([testPromise, timeoutPromise]);

        const duration = performance.now() - startTime;
        if (!silent) {
            console.log(chalk.green(`✅ ${path.basename(testFile)} (${duration.toFixed(2)}ms)`));
        }
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
export async function runWebTests(testFiles, options = {}) {
    const {
        parallel = false,
        timeout = 5000,
        silent = false,
        batchSize = 5
    } = options;

    state.resetCounters();
    state.startTimer();

    if (!silent) {
        console.log(chalk.bold.magenta(`\nRunning ${testFiles.length} web test file(s)`));
    }

    try {
        if (parallel) {
            if (batchSize > 0) {
                // Run tests in batches
                const batches = [];
                for (let i = 0; i < testFiles.length; i += batchSize) {
                    batches.push(testFiles.slice(i, i + batchSize));
                }

                for (const [index, batch] of batches.entries()) {
                    if (!silent) {
                        console.log(chalk.blue(`\nBatch ${index + 1}/${batches.length}`));
                    }

                    await Promise.all(
                        batch.map(file => runWebTestFile(file, { timeout, silent }))
                    );
                }
            } else {
                // Run all tests in parallel
                await Promise.all(
                    testFiles.map(file => runWebTestFile(file, { timeout, silent }))
                );
            }
        } else {
            // Run tests sequentially
            for (const file of testFiles) {
                await runWebTestFile(file, { timeout, silent });
            }
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

    if (!silent) {
        console.log(chalk.bold.cyan('\nTest Summary:'));
        console.log(chalk.blue(`  Total: ${summary.totalTests}`));
        console.log(chalk.green(`  Passed: ${summary.passedTests}`));
        console.log(chalk.red(`  Failed: ${summary.failedTests}`));
        console.log(chalk.blue(`  Time: ${summary.executionTime}s`));
    }

    return summary;
}

/**
 * Run a web test function
 * @async
 * @function runWebTestFunction
 * @param {Function} testFn - Test function to run
 * @param {object} [options={}] - Options for running the test
 * @returns {Promise<object>} Test results
 */
export async function runWebTestFunction(testFn, options = {}) {
    const {
        timeout = 5000,
        silent = false
    } = options;

    state.resetCounters();
    state.startTimer();

    const suite = {
        description: `Function: ${testFn.name}`,
        tests: [],
        startTime: performance.now()
    };

    state.pushSuite(suite);

    try {
        const testPromise = Promise.resolve(testFn());
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Test function ${testFn.name} timed out after ${timeout}ms`)), timeout);
        });

        await Promise.race([testPromise, timeoutPromise]);
    } catch (error) {
        console.error(chalk.red(`Error in test ${testFn.name}:`));
        console.error(chalk.red(error.stack));
        state.failedTests++;
    } finally {
        suite.duration = performance.now() - suite.startTime;
        state.testResults.push(suite);
        state.popSuite();
    }

    const summary = {
        totalTests: state.passedTests + state.failedTests,
        passedTests: state.passedTests,
        failedTests: state.failedTests,
        executionTime: state.getExecutionTime(),
        testResults: state.testResults
    };

    if (!silent) {
        console.log(chalk.bold.cyan('\nTest Summary:'));
        console.log(chalk.blue(`  Total: ${summary.totalTests}`));
        console.log(chalk.green(`  Passed: ${summary.passedTests}`));
        console.log(chalk.red(`  Failed: ${summary.failedTests}`));
        console.log(chalk.blue(`  Time: ${summary.executionTime}s`));
    }

    return summary;
}