/**
 * Codi Test Framework - Browser Bundle
 * Version: v1.0.39-beta
 * Generated: 2025-06-16T14:35:19.727Z
 * Build tool: esbuild
 *
 * @license MIT
 */
'use strict';
var codi = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) =>
    key in obj
      ? __defProp(obj, key, {
          enumerable: true,
          configurable: true,
          writable: true,
          value,
        })
      : (obj[key] = value);
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
      for (const key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, '__esModule', { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== 'symbol' ? key + '' : key, value);
    return value;
  };

  // src/_codi.browser.js
  var codi_browser_exports = {};
  __export(codi_browser_exports, {
    assertEqual: () => assertEqual2,
    assertFalse: () => assertFalse2,
    assertNoDuplicates: () => assertNoDuplicates2,
    assertNotEqual: () => assertNotEqual2,
    assertThrows: () => assertThrows2,
    assertTrue: () => assertTrue2,
    codepenLogging: () => codepenLogging,
    codi: () => codi,
    default: () => codi_browser_default,
    describe: () => describe,
    it: () => it,
    runWebTestFile: () => runWebTestFile,
    runWebTestFunction: () => runWebTestFunction,
    runWebTests: () => runWebTests,
    state: () => state,
    version: () => version,
  });

  // scripts/chalk-browser-stub.js
  var chalk_browser_stub_default = {
    red: (text) => text,
    green: (text) => text,
    yellow: (text) => text,
    blue: (text) => text,
    magenta: (text) => text,
    cyan: (text) => text,
    white: (text) => text,
    gray: (text) => text,
    bold: {
      red: (text) => text,
      green: (text) => text,
      yellow: (text) => text,
      blue: (text) => text,
      magenta: (text) => text,
      cyan: (text) => text,
      white: (text) => text,
      underline: (text) => text,
    },
    underline: (text) => text,
  };

  // src/assertions/assertEqual.js
  function assertEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected)) {
      throw new Error(
        message ||
          `Expected ${chalk_browser_stub_default.bold.yellow(JSON.stringify(actual))} to deeply equal ${chalk_browser_stub_default.bold.yellow(JSON.stringify(expected))}`,
      );
    }
  }
  function isDeepEqual(obj1, obj2) {
    if (obj1 === obj2) {
      return true;
    }
    if (
      typeof obj1 !== 'object' ||
      typeof obj2 !== 'object' ||
      obj1 === null ||
      obj2 === null
    ) {
      return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }

  // src/assertions/assertFalse.js
  function assertFalse(actual, message) {
    if (actual !== false) {
      throw new Error(
        message ||
          `Expected ${chalk_browser_stub_default.bold.yellow(actual)} to be false`,
      );
    }
  }

  // src/assertions/assertNoDuplicates.js
  function assertNoDuplicates(arr, message) {
    arr = arr.filter((item, index) => arr.indexOf(item) !== index);
    if (arr.length > 0) {
      throw new Error(
        message ||
          `Duplicates found: ${chalk_browser_stub_default.bold.yellow(arr)}`,
      );
    }
  }

  // src/assertions/assertNotEqual.js
  function assertNotEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(
        message ||
          `Expected ${chalk_browser_stub_default.bold.yellow(actual)} not to equal ${chalk_browser_stub_default.bold.yellow(expected)}`,
      );
    }
  }

  // src/assertions/assertThrows.js
  function assertThrows(callback, errorMessage, message) {
    try {
      callback();
      throw new Error(message || 'Expected an error to be thrown');
    } catch (error) {
      if (error.message !== errorMessage) {
        throw new Error(
          message ||
            `Expected error message to be ${chalk_browser_stub_default.bold.yellow(errorMessage)}, but got ${chalk_browser_stub_default.bold.yellow(error.message)}`,
        );
      }
    }
  }

  // src/assertions/assertTrue.js
  function assertTrue(actual, message) {
    if (actual !== true) {
      throw new Error(
        message ||
          `Expected ${chalk_browser_stub_default.bold.yellow(actual)} to be true`,
      );
    }
  }

  // src/assertions/_assertions.js
  var assertions_default = {
    assertEqual,
    assertNotEqual,
    assertTrue,
    assertFalse,
    assertThrows,
    assertNoDuplicates,
  };

  // src/codepen/logging.js
  function codepenLogging() {
    var following = false,
      pre = document.createElement('pre'),
      code = document.createElement('code');
    pre.appendChild(code);
    document.body.appendChild(pre);
    var originalConsole = {
      log: window.console.log,
      info: window.console.info,
      warn: window.console.warn,
      error: window.console.error,
    };
    function clear() {
      while (code.hasChildNodes()) {
        code.removeChild(code.lastChild);
      }
    }
    function follow() {
      following = true;
    }
    function print(className, ...objects) {
      let s = objects
        .map((obj) => {
          if (typeof obj === 'string') {
            return obj;
          } else {
            try {
              return JSON.stringify(obj);
            } catch (e) {
              return String(obj);
            }
          }
        })
        .join(' ');
      s = s.replace(/\[\d{1,2}m/g, '');
      var span = document.createElement('span'),
        text = document.createTextNode(s + '\n');
      span.setAttribute('class', className);
      span.appendChild(text);
      code.appendChild(span);
      if (following) {
        scrollToBottom();
      }
    }
    function scrollToBottom() {
      window.scrollTo(0, document.body.scrollHeight);
    }
    window.console = {
      clear,
      follow,
      log: function (...args) {
        print('debug', ...args);
        originalConsole.log(...args);
      },
      info: function (...args) {
        print('info', ...args);
        originalConsole.info(...args);
      },
      warn: function (...args) {
        print('warn', ...args);
        originalConsole.warn(...args);
      },
      error: function (...args) {
        print('error', ...args);
        originalConsole.error(...args);
      },
    };
    return window.console;
  }

  // src/state/TestState.js
  var TestState = class {
    constructor() {
      // Track all running tests
      __publicField(this, 'testTracker', {
        pendingTests: /* @__PURE__ */ new Set(),
        addTest: function (promise) {
          this.pendingTests.add(promise);
          promise.finally(() => this.pendingTests.delete(promise));
        },
        waitForAll: function () {
          return Promise.all(Array.from(this.pendingTests));
        },
      });
      this.passedTests = 0;
      this.failedTests = 0;
      this.suiteStack = {};
      this.startTime = null;
      this.options = {};
    }
    setOptions(options) {
      this.options = __spreadValues(__spreadValues({}, this.options), options);
    }
    resetCounters() {
      this.passedTests = 0;
      this.failedTests = 0;
      this.suiteStack = {};
    }
    startTimer() {
      this.startTime = performance.now();
    }
    getExecutionTime() {
      return ((performance.now() - this.startTime) / 1e3).toFixed(2);
    }
    /**
     * Add a new suite to the stack and register it
     * @method
     * @param {object} suite - Test suite to add
     */
    pushSuite(suite) {
      let parentSuite = '';
      if (suite.parentId) {
        parentSuite = this.getSuite(suite.parentId);
      } else {
        if (this.suiteStack[suite.id]) {
          console.warn(
            chalk_browser_stub_default.yellow(
              `There is already a Suite with the ID: ${suite.id}`,
            ),
          );
          suite.id = suite.name + suite.id;
        }
      }
      const nestedSuite = __spreadProps(__spreadValues({}, suite), {
        children: [],
        tests: [],
      });
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
     * @param {string} path - Full suite path
     * @returns {object|undefined} Found suite
     */
    getSuite(parentId) {
      const suite = this.suiteStack[parentId];
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
     * Add test to a specific suite
     * @method
     * @param {string} suitePath - Full suite path
     * @param {object} test - Test case to add
     */
    addTestToSuite(suite, test) {
      suite.tests.push(test);
    }
    printSummary() {
      Object.keys(this.suiteStack).forEach((id) => {
        printSuite(this.suiteStack[id], 0, this.options);
      });
      console.log(chalk_browser_stub_default.bold.cyan('\nTest Summary:'));
      console.log(
        chalk_browser_stub_default.green(`  Passed: ${this.passedTests}`),
      );
      console.log(
        chalk_browser_stub_default.red(`  Failed: ${this.failedTests}`),
      );
      console.log(
        chalk_browser_stub_default.blue(`  Time: ${this.getExecutionTime()}s`),
      );
    }
  };
  var printSuite = (suite, indent, options) => {
    const indentation = '  '.repeat(indent);
    let results = suite.tests;
    let hasFailingChildren = false;
    if (options.quiet) {
      results = results.filter((result) => result.status === 'failed');
    }
    function hasFailingTests(suite2) {
      var _a;
      if (
        (_a = suite2.tests) == null
          ? void 0
          : _a.some((test) => test.status === 'failed')
      ) {
        return true;
      }
      if (suite2.children) {
        return suite2.children.some((child) => hasFailingTests(child));
      }
      return false;
    }
    if (suite.children) {
      hasFailingChildren = suite.children.some((child) =>
        hasFailingTests(child),
      );
    }
    if (
      (suite.children.length > 0 && hasFailingChildren) ||
      results.length > 0
    ) {
      console.log(
        '\n' +
          indentation +
          chalk_browser_stub_default.yellow(
            chalk_browser_stub_default.bold(suite.name),
          ),
      );
    }
    results.forEach((result) => {
      var _a;
      if (result.status === 'failed') {
        console.log(
          indentation +
            chalk_browser_stub_default.red(
              `  \u2514\u2500 \u26D4 ${result.name} (${result.duration.toFixed(2)}ms)`,
            ),
        );
        const errorMessage = ((_a = result.error) == null ? void 0 : _a.message)
          ? result.error.message
          : 'Unknown error';
        console.log(
          indentation + chalk_browser_stub_default.red(`     ${errorMessage}`),
        );
      } else {
        console.log(
          indentation +
            chalk_browser_stub_default.green(
              `  \u2514\u2500 \u2705 ${result.name} (${result.duration.toFixed(2)}ms)`,
            ),
        );
      }
    });
    if (suite.children) {
      suite.children.forEach((child) => printSuite(child, indent + 1, options));
    }
  };
  var state = new TestState();

  // src/core/describe.js
  async function describe(params, callback) {
    const suite = {
      name: params.name,
      id: params.id,
      parentId: params.parentId,
      startTime: performance.now(),
    };
    const nestedSuite = state.pushSuite(suite);
    const suitePromise = (async () => {
      try {
        await Promise.resolve(callback(suite));
      } catch (error) {
        console.error(
          chalk_browser_stub_default.red(
            `Suite failed: ${nestedSuite.fullPath}`,
          ),
        );
        console.error(chalk_browser_stub_default.red(error.stack));
      } finally {
        nestedSuite.duration = performance.now() - nestedSuite.startTime;
      }
    })();
    state.testTracker.addTest(suitePromise);
    return suitePromise;
  }

  // src/core/it.js
  async function it(params, callback) {
    const suite = state.getSuite(params.parentId);
    if (!suite) {
      throw new Error(`test: ${params.name} needs to belong to a suite`);
    }
    const test = {
      name: params.name,
      startTime: performance.now(),
    };
    const testPromise = (async () => {
      try {
        await Promise.resolve(callback());
        test.status = 'passed';
        test.duration = performance.now() - test.startTime;
        state.passedTests++;
      } catch (error) {
        test.status = 'failed';
        test.error = error;
        test.duration = performance.now() - test.startTime;
        state.failedTests++;
      } finally {
        state.addTestToSuite(suite, test);
      }
    })();
    state.testTracker.addTest(testPromise);
    return testPromise;
  }

  // src/runners/webRunner.js
  async function runWebTestFile(testFile, options) {
    const defaults = {
      silent: false,
    };
    options != null ? options : (options = defaults);
    try {
      const testPromise = import(testFile);
      await Promise.resolve(testPromise);
    } catch (error) {
      console.error(`Error running test file ${testFile}:`);
      console.error(error.stack);
      state.failedTests++;
    }
  }
  async function runWebTests(testFiles, options) {
    const defaults = {
      quiet: false,
      showSummary: true,
    };
    options != null ? options : (options = defaults);
    state.resetCounters();
    state.startTimer();
    if (!options.quiet) {
      console.log(
        chalk_browser_stub_default.bold.magenta(`
Running ${testFiles.length} web test file(s)`),
      );
    }
    try {
      for (const file of testFiles) {
        await runWebTestFile(file, options);
      }
    } catch (error) {
      console.error(chalk_browser_stub_default.red('\nTest execution failed:'));
      console.error(chalk_browser_stub_default.red(error.stack));
    }
    const summary = {
      totalTests: state.passedTests + state.failedTests,
      passedTests: state.passedTests,
      failedTests: state.failedTests,
      executionTime: state.getExecutionTime(),
      suiteStack: state.suiteStack,
    };
    if (options.showSummary) {
      state.printSummary();
    }
    return summary;
  }
  async function runWebTestFunction(testFn, options) {
    options != null
      ? options
      : (options = {
          quiet: false,
          showSummary: true,
        });
    state.setOptions(options);
    try {
      await Promise.resolve(testFn());
      await state.testTracker.waitForAll();
    } catch (error) {
      console.error('Error in test suite:', error);
      state.failedTests++;
    }
    if (options.showSummary) {
      state.printSummary();
    }
    return {
      passedTests: state.passedTests,
      failedTests: state.failedTests,
      suiteStack: state.suiteStack,
    };
  }

  // src/_codi.browser.js
  var version = 'v1.0.39';
  var codi = {
    describe,
    it,
    state,
    runWebTests,
    runWebTestFile,
    runWebTestFunction,
    assertEqual: assertions_default.assertEqual,
    assertNotEqual: assertions_default.assertNotEqual,
    assertTrue: assertions_default.assertTrue,
    assertFalse: assertions_default.assertFalse,
    assertThrows: assertions_default.assertThrows,
    assertNoDuplicates: assertions_default.assertNoDuplicates,
    version,
    codepenLogging,
  };
  globalThis.codi = codi;
  var {
    assertEqual: assertEqual2,
    assertNotEqual: assertNotEqual2,
    assertTrue: assertTrue2,
    assertFalse: assertFalse2,
    assertThrows: assertThrows2,
    assertNoDuplicates: assertNoDuplicates2,
  } = assertions_default;
  var codi_browser_default = codi;
  return __toCommonJS(codi_browser_exports);
})();
//# sourceMappingURL=codi.browser.js.map
