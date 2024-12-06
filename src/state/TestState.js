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
        /** @type {Array} Stack of active test suites */
        this.suiteStack = {};
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
        this.emit('optionsUpdated', this.options);
    }

    resetCounters() {
        this.passedTests = 0;
        this.failedTests = 0;
        this.suiteStack = {};
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
     * Add a new suite to the stack and register it
     * @method
     * @param {object} suite - Test suite to add
     */
    pushSuite(suite) {

        let parentSuite = '';
        // Get parent suite if exists
        if (suite.parentId) {
            parentSuite = this.getSuite(suite.parentId)
        }
        else {
            if (this.suiteStack[suite.id]) {
                console.warn(chalk.yellow(`There is already a Suite with the ID: ${suite.id}`));
                suite.id = suite.name + suite.id;
            }
        }

        // Create nested suite structure
        const nestedSuite = {
            ...suite,
            children: [],
            tests: []
        };

        // Add to parent's children if exists
        if (parentSuite) {
            parentSuite.children.push(nestedSuite);
        } else {
            this.suiteStack[suite.id] = nestedSuite;
        }

        // this.emit('suitePushed', nestedSuite);

        return nestedSuite;
    }

    /**
     * Get suite by id.
     * @method
     * @param {string} path - Full suite path
     * @returns {object|undefined} Found suite
     */
    getSuite(parentId) {
        let suite = this.suiteStack[parentId];

        if (suite) {
            return suite;
        }

        return this.searchSuiteStack(parentId, this.suiteStack);
    }


    /**
     * Search the stack  on each child 
     * @param {string} parentId 
     * @param {object} suiteStack 
     * @returns {object}
     */
    searchSuiteStack(parentId, suiteStack) {
        // Helper function to search recursively through children
        function searchRecursively(suite) {
            // Check if current suite matches the ID
            if (suite.id === parentId) {
                return suite;
            }

            // If suite has children, search through them
            if (suite.children && suite.children.length > 0) {
                for (const child of suite.children) {
                    const result = searchRecursively(child);
                    if (result) {
                        return result;
                    }
                }
            }

            return null;
        }

        // Search through each top-level suite in the stack
        for (const nestedSuite of Object.values(suiteStack)) {
            const result = searchRecursively(nestedSuite);
            if (result) {
                return result;
            }
        }

        return null;
    }

    /**
     * Add test to a specific suite
     * @method
     * @param {string} suitePath - Full suite path
     * @param {object} test - Test case to add
     */
    addTestToSuite(suite, test) {
        suite.tests.push(test);
        this.emit('testAdded', { suite, test });
    }

    printSummary() {

        Object.keys(this.suiteStack).forEach(id => {
            printSuite(this.suiteStack[id], 0, this.options);
        });

        console.log(chalk.bold.cyan('\nTest Summary:'));
        console.log(chalk.green(`  Passed: ${this.passedTests}`));
        console.log(chalk.red(`  Failed: ${this.failedTests}`));
        console.log(chalk.blue(`  Time: ${this.getExecutionTime()}s`));

        this.emit('summaryPrinted');
    }
}

// Helper function to print suite and its children
const printSuite = (suite, indent, options) => {
    const indentation = '  '.repeat(indent);

    // Print suite's tests
    let results = suite.tests;
    if (options.quiet) {
        results = results.filter(result => result.status === 'failed');
    }

    // Print suite name
    if (suite.children.length > 0 || results.length > 0) {
        console.log('\n' + indentation + chalk.yellow(chalk.bold(suite.name)));
    }

    results.forEach(result => {
        if (result.status === 'failed') {
            console.log(indentation + chalk.red(`  └─ ⛔ ${result.name} (${result.duration.toFixed(2)}ms)`));
            console.log(indentation + chalk.red(`     ${result.error.message}`));
        } else {
            console.log(indentation + chalk.green(`  └─ ✅ ${result.name} (${result.duration.toFixed(2)}ms)`));
        }
    });

    // Print child suites
    if (suite.children) {
        suite.children.forEach(child => printSuite(child, indent + 1, options));
    }
};

export const state = new TestState();