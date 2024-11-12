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
        this.options = options;
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
     * Get the current test suite
     * @method
     * @returns {object|null} Current test suite or null if none active
     */
    get currentSuite() {
        return this.suiteStack[this.suiteStack.length - 1] || null;
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
        if (state.options.quiet) {
            state.printFailures();
        }
        // Always show the final summary
        console.log(chalk.bold.cyan('\nTest Summary:'));
        console.log(chalk.green(`  Passed: ${state.passedTests}`));
        console.log(chalk.red(`  Failed: ${state.failedTests}`));
        console.log(chalk.blue(`  Time: ${state.getExecutionTime()}s`));
    }

    printFailures() {

        if (this.testResults.length > 0) {
            this.testResults.forEach(suite => {

                const failures = suite.tests.filter(test => test.status === 'failed');

                if (failures.length > 0) {
                    console.log('\nFailed Tests:');
                    failures.forEach(failure => {
                        console.log('\n' + chalk.red('✖ ' + chalk.bold(suite.description)));
                        console.log(chalk.red(`  └─ ${failure.description}`));
                        console.log(chalk.red(`     ${failure.error.message}`));
                    });
                }

            });
        }
    }
}

export const state = new TestState();