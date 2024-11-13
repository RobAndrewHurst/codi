import chalk from 'chalk';
import EventEmitter from 'events';

/**
 * Class representing the state of test execution
 * @class TestState
 */
class TestState extends EventEmitter {
    constructor() {
        super();
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
        /** @type {Map} Map of suite paths to suite objects */
        this.suiteMap = new Map();
    }

    setOptions(options) {
        this.options = {
            ...this.options,
            ...options
        };
        this.emit('optionsUpdated', this.options);
    }

    resetCounters() {
        this.passedTests = 0;
        this.failedTests = 0;
        this.testResults = [];
        this.suiteStack = [];
        this.suiteMap.clear();
        this.emit('stateReset');
    }

    startTimer() {
        this.startTime = performance.now();
        this.emit('timerStarted', this.startTime);
    }

    getExecutionTime() {
        return ((performance.now() - this.startTime) / 1000).toFixed(2);
    }

    /**
     * Get current suite path based on stack
     * @returns {string} Full path of current suite stack
     */
    _getFullSuitePath() {
        return this.suiteStack.map(suite => suite.description).join(' > ');
    }

    /**
     * Add a new suite to the stack and register it
     * @method
     * @param {object} suite - Test suite to add
     */
    pushSuite(suite) {
        // Get parent suite if exists
        const parentSuite = this.suiteStack[this.suiteStack.length - 1];

        // Create nested suite structure
        const nestedSuite = {
            ...suite,
            fullPath: parentSuite
                ? `${parentSuite.fullPath} > ${suite.description}`
                : suite.description,
            parent: parentSuite,
            children: [],
            tests: []
        };

        // Add to parent's children if exists
        if (parentSuite) {
            parentSuite.children.push(nestedSuite);
        }

        this.suiteStack.push(nestedSuite);
        this.suiteMap.set(nestedSuite.fullPath, nestedSuite);
        this.emit('suitePushed', nestedSuite);

        return nestedSuite;
    }

    /**
     * Remove and return the top suite from the stack
     * @method
     * @returns {object|undefined} Removed test suite
     */
    popSuite() {
        const suite = this.suiteStack.pop();
        this.emit('suitePopped', suite);
        return suite;
    }

    /**
     * Get current active suite
     * @method
     * @returns {object|undefined} Current suite
     */
    getCurrentSuite() {
        return this.suiteStack[this.suiteStack.length - 1];
    }

    /**
     * Get suite by full path
     * @method
     * @param {string} path - Full suite path
     * @returns {object|undefined} Found suite
     */
    getSuiteByPath(path) {
        return this.suiteMap.get(path);
    }

    /**
     * Add test to a specific suite
     * @method
     * @param {string} suitePath - Full suite path
     * @param {object} test - Test case to add
     */
    addTestToSuite(suitePath, test) {
        const suite = this.getSuiteByPath(suitePath);
        if (!suite) {
            throw new Error(`Cannot find suite: ${suitePath}`);
        }
        suite.tests.push(test);
        this.emit('testAdded', { suite, test });
    }

    printSummary() {
        if (this.testResults.length > 0) {
            // Helper function to print suite and its children
            const printSuite = (suite, indent = 0) => {
                const indentation = '  '.repeat(indent);

                // Print suite's tests
                let results = suite.tests;
                if (this.options.quiet) {
                    results = results.filter(result => result.status === 'failed');
                }

                // Print suite description
                if (results.length > 0) {
                    console.log('\n' + indentation + chalk.yellow(chalk.bold(suite.description)));
                }

                results.forEach(result => {
                    if (result.status === 'failed') {
                        console.log(indentation + chalk.red(`  └─ ⛔ ${result.description} (${result.duration.toFixed(2)}ms)`));
                        console.log(indentation + chalk.red(`     ${result.error.message}`));
                    } else {
                        console.log(indentation + chalk.green(`  └─ ✅ ${result.description} (${result.duration.toFixed(2)}ms)`));
                    }
                });

                // Print child suites
                if (suite.children) {
                    suite.children.forEach(child => printSuite(child, indent + 1));
                }
            };

            // Print only top-level suites (they will handle their children)
            this.testResults
                .filter(suite => !suite.parent)
                .forEach(suite => printSuite(suite));
        }

        console.log(chalk.bold.cyan('\nTest Summary:'));
        console.log(chalk.green(`  Passed: ${this.passedTests}`));
        console.log(chalk.red(`  Failed: ${this.failedTests}`));
        console.log(chalk.blue(`  Time: ${this.getExecutionTime()}s`));

        this.emit('summaryPrinted');
    }
}

export const state = new TestState();