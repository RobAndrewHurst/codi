import chalk from 'chalk';
import { getReporter } from '../reporters/index.js';

/**
 * Class representing the state of test execution
 * @class TestState
 */
class TestState {
  constructor() {
    /** @type {number} Number of passed tests */
    this.passedTests = 0;
    /** @type {number} Number of failed tests */
    this.failedTests = 0;
    /** @type {number} Number of skipped tests */
    this.skippedTests = 0;
    /** @type {object} Tree of registered test suites keyed by top-level id */
    this.suiteStack = {};
    /** @type {number|null} Test start time */
    this.startTime = null;
    /** @type {object} Runtime options (quiet, etc.) */
    this.options = {};
    /** @type {boolean} Whether any .only modifier has been registered */
    this.hasOnly = false;
    /** @type {Array} Stack for implicit lexical nesting (auto-generated suite ids) */
    this.contextStack = [];
    /** @type {number} Auto-increment counter for generating unique suite ids */
    this._autoId = 0;
  }

  /**
   * Generate a unique auto-incremented suite id.
   * @returns {string}
   */
  generateId() {
    return `__auto_${++this._autoId}`;
  }

  /**
   * Push a suite id onto the implicit nesting context stack.
   * @param {string} id
   */
  pushContext(id) {
    this.contextStack.push(id);
  }

  /**
   * Pop the top suite id from the implicit nesting context stack.
   * @returns {string|undefined}
   */
  popContext() {
    return this.contextStack.pop();
  }

  /**
   * Get the current (topmost) suite id from the context stack.
   * @returns {string|undefined}
   */
  currentContext() {
    return this.contextStack.length > 0
      ? this.contextStack[this.contextStack.length - 1]
      : undefined;
  }

  setOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
    // Parse grep pattern into a RegExp if provided
    if (options.grep) {
      // Support /regex/flags syntax
      const regexMatch = options.grep.match(/^\/(.+)\/([gimsuy]*)$/);
      if (regexMatch) {
        this._grepPattern = new RegExp(regexMatch[1], regexMatch[2]);
      } else {
        this._grepPattern = new RegExp(options.grep, 'i');
      }
    }
  }

  /**
   * Check if a test/suite name matches the current grep pattern.
   * Returns true if no grep pattern is set (everything matches).
   * @param {string} name
   * @returns {boolean}
   */
  matchesGrep(name) {
    if (!this._grepPattern) return true;
    return this._grepPattern.test(name);
  }

  resetCounters() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.suiteStack = {};
    this.hasOnly = false;
    this.contextStack = [];
    this._autoId = 0;
    this._grepPattern = null;
  }

  startTimer() {
    this.startTime = performance.now();
  }

  getExecutionTime() {
    return ((performance.now() - this.startTime) / 1000).toFixed(2);
  }

  /**
   * Add a new suite to the stack and register it.
   * @method
   * @param {object} suite - Test suite to add
   * @returns {object} The nested suite object with hooks and metadata
   */
  pushSuite(suite) {
    let parentSuite = '';
    // Get parent suite if exists
    if (suite.parentId) {
      parentSuite = this.getSuite(suite.parentId);
    } else {
      if (this.suiteStack[suite.id]) {
        console.warn(
          chalk.yellow(`There is already a Suite with the ID: ${suite.id}`),
        );
        suite.id = suite.name + suite.id;
      }
    }

    // Create nested suite structure with lifecycle hook arrays
    const nestedSuite = {
      ...suite,
      children: [],
      tests: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
      parent: parentSuite || null,
    };

    // Add to parent's children if exists
    if (parentSuite) {
      parentSuite.children.push(nestedSuite);
    } else {
      this.suiteStack[suite.id] = nestedSuite;
    }

    return nestedSuite;
  }

  /**
   * Get suite by id.
   * @method
   * @param {string} parentId - Suite id to find
   * @returns {object|null} Found suite
   */
  getSuite(parentId) {
    const suite = this.suiteStack[parentId];

    if (suite) {
      return suite;
    }

    return this.searchSuiteStack(parentId, this.suiteStack);
  }

  /**
   * Search the stack recursively on each child.
   * @param {string} parentId
   * @param {object} suiteStack
   * @returns {object|null}
   */
  searchSuiteStack(parentId, suiteStack) {
    function searchRecursively(suite) {
      if (suite.id === parentId) {
        return suite;
      }

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

    for (const nestedSuite of Object.values(suiteStack)) {
      const result = searchRecursively(nestedSuite);
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Collect all beforeEach hooks from the suite and its ancestors.
   * Returns them in outermost-first order.
   * @param {object} suite
   * @returns {Function[]}
   */
  collectBeforeEach(suite) {
    const hooks = [];
    let current = suite;
    while (current) {
      if (current.beforeEach && current.beforeEach.length > 0) {
        hooks.unshift(...current.beforeEach);
      }
      current = current.parent;
    }
    return hooks;
  }

  /**
   * Collect all afterEach hooks from the suite and its ancestors.
   * Returns them in innermost-first order.
   * @param {object} suite
   * @returns {Function[]}
   */
  collectAfterEach(suite) {
    const hooks = [];
    let current = suite;
    while (current) {
      if (current.afterEach && current.afterEach.length > 0) {
        hooks.push(...current.afterEach);
      }
      current = current.parent;
    }
    return hooks;
  }

  /**
   * Add test to a specific suite.
   * @method
   * @param {object} suite - The suite to add the test to
   * @param {object} test - Test case to add
   */
  addTestToSuite(suite, test) {
    suite.tests.push(test);
  }

  printSummary() {
    const reporterName = this.options.reporter || 'console';
    const reporter = getReporter(reporterName);

    reporter.report(
      {
        suiteStack: this.suiteStack,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        skippedTests: this.skippedTests,
        executionTime: this.getExecutionTime(),
      },
      this.options,
    );
  }

  // Track all running tests
  testTracker = {
    pendingTests: new Set(),
    addTest: function (promise) {
      this.pendingTests.add(promise);
      promise.finally(() => this.pendingTests.delete(promise));
    },
    waitForAll: function () {
      return Promise.all(Array.from(this.pendingTests));
    },
  };
}

export const state = new TestState();
