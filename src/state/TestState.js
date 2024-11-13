import chalk from 'chalk';
/**
 * Class representing the state of test execution
 * @class TestState
 */
class TestState {
    /**
     * Create a test state instance
     * @constructor
     */
    constructor() {
        /** @type {number} Number of passed tests */
        this.passedTests = 0;

        /** @type {number} Number of failed tests */
        this.failedTests = 0;

        /** @type {Array} Collection of test results */
        this.testResults = [];

        /** @type {Array} Stack of active test suites */
        this.suiteStack = [];

        /** @type {number|null} Test start time */
        this.startTime = null;

        /** @type {object} options */
        this.options = {};
    }

    setOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };
    }

    /**
     * Reset all counters and state
     * @method
     */
    resetCounters() {
        this.passedTests = 0;
        this.failedTests = 0;
        this.testResults = [];
        this.suiteStack = [];
    }

    /**
     * Start the test timer
     * @method
     */
    startTimer() {
        this.startTime = performance.now();
    }

    /**
     * Get the total execution time
     * @method
     * @returns {string} Execution time in seconds
     */
    getExecutionTime() {
        return ((performance.now() - this.startTime) / 1000).toFixed(2);
    }

    /**
     * Add a new suite to the stack
     * @method
     * @param {object} suite - Test suite to add
     */
    pushSuite(suite) {
        this.suiteStack.push(suite);
    }

    /**
     * Remove and return the top suite from the stack
     * @method
     * @returns {object|undefined} Removed test suite
     */
    popSuite() {
        return this.suiteStack.pop();
    }

    printSummary() {

        if (this.testResults.length > 0) {
            this.testResults.forEach(suite => {

                let results = suite.tests;

                if (state.options.quiet) {
                    results = results.filter(result => result.status === 'failed');
                }

                if (results.length > 0) {
                    console.log('\n' + chalk.yellow('' + chalk.bold(suite.description)));
                }

                if (results.length > 0) {
                    results.forEach(result => {

                        if (result.status === 'failed') {
                            console.log(chalk.red(`  └─ ⛔ ${result.description} (${result.duration.toFixed(2)}ms)`));
                            console.log(chalk.red(`     ${result.error.message}`));
                        } else {
                            console.log(chalk.green(`  └─ ✅ ${result.description} (${result.duration.toFixed(2)}ms)`));
                        }


                    });
                }

            });
        }
        // Always show the final summary
        console.log(chalk.bold.cyan('\nTest Summary:'));
        console.log(chalk.green(`  Passed: ${state.passedTests}`));
        console.log(chalk.red(`  Failed: ${state.failedTests}`));
        console.log(chalk.blue(`  Time: ${state.getExecutionTime()}s`));
    }

}

export const state = new TestState();