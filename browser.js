var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/assertions/assertEqual.js
import chalk from "chalk";
function assertEqual(actual, expected, message) {
  if (!isDeepEqual(actual, expected)) {
    throw new Error(message || `Expected ${chalk.bold.yellow(JSON.stringify(actual))} to deeply equal ${chalk.bold.yellow(JSON.stringify(expected))}`);
  }
}
function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }
  if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
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

// src/assertions/assertNotEqual.js
import chalk2 from "chalk";
function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    throw new Error(message || `Expected ${chalk2.bold.yellow(actual)} not to equal ${chalk2.bold.yellow(expected)}`);
  }
}

// src/assertions/assertTrue.js
import chalk3 from "chalk";
function assertTrue(actual, message) {
  if (actual !== true) {
    throw new Error(message || `Expected ${chalk3.bold.yellow(actual)} to be true`);
  }
}

// src/assertions/assertFalse.js
import chalk4 from "chalk";
function assertFalse(actual, message) {
  if (actual !== false) {
    throw new Error(message || `Expected ${chalk4.bold.yellow(actual)} to be false`);
  }
}

// src/assertions/assertThrows.js
import chalk5 from "chalk";
function assertThrows(callback, errorMessage, message) {
  try {
    callback();
    throw new Error(message || "Expected an error to be thrown");
  } catch (error) {
    if (error.message !== errorMessage) {
      throw new Error(message || `Expected error message to be ${chalk5.bold.yellow(errorMessage)}, but got ${chalk5.bold.yellow(error.message)}`);
    }
  }
}

// src/assertions/assertNoDuplicates.js
import chalk6 from "chalk";
function assertNoDuplicates(arr, message) {
  arr = arr.filter((item, index) => arr.indexOf(item) !== index);
  if (arr.length > 0) {
    throw new Error(message || `Duplicates found: ${chalk6.bold.yellow(arr)}`);
  }
}

// src/assertions/_assertions.js
var assertions_default = {
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  assertNoDuplicates
};

// src/core/describe.js
import chalk8 from "chalk";

// src/state/TestState.js
import chalk7 from "chalk";
var TestState = class {
  constructor() {
    // Track all running tests
    __publicField(this, "testTracker", {
      pendingTests: /* @__PURE__ */ new Set(),
      addTest: function(promise) {
        this.pendingTests.add(promise);
        promise.finally(() => this.pendingTests.delete(promise));
      },
      waitForAll: function() {
        return Promise.all(Array.from(this.pendingTests));
      }
    });
    this.passedTests = 0;
    this.failedTests = 0;
    this.suiteStack = {};
    this.startTime = null;
    this.options = {};
  }
  setOptions(options) {
    this.options = {
      ...this.options,
      ...options
    };
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
    let parentSuite = "";
    if (suite.parentId) {
      parentSuite = this.getSuite(suite.parentId);
    } else {
      if (this.suiteStack[suite.id]) {
        console.warn(chalk7.yellow(`There is already a Suite with the ID: ${suite.id}`));
        suite.id = suite.name + suite.id;
      }
    }
    const nestedSuite = {
      ...suite,
      children: [],
      tests: []
    };
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
    console.log(chalk7.bold.cyan("\nTest Summary:"));
    console.log(chalk7.green(`  Passed: ${this.passedTests}`));
    console.log(chalk7.red(`  Failed: ${this.failedTests}`));
    console.log(chalk7.blue(`  Time: ${this.getExecutionTime()}s`));
  }
};
var printSuite = (suite, indent, options) => {
  const indentation = "  ".repeat(indent);
  let results = suite.tests;
  if (options.quiet) {
    results = results.filter((result) => result.status === "failed");
  }
  if (suite.children.length > 0 || results.length > 0) {
    console.log("\n" + indentation + chalk7.yellow(chalk7.bold(suite.name)));
  }
  results.forEach((result) => {
    if (result.status === "failed") {
      console.log(indentation + chalk7.red(`  \u2514\u2500 \u26D4 ${result.name} (${result.duration.toFixed(2)}ms)`));
      console.log(indentation + chalk7.red(`     ${result.error.message}`));
    } else {
      console.log(indentation + chalk7.green(`  \u2514\u2500 \u2705 ${result.name} (${result.duration.toFixed(2)}ms)`));
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
    startTime: performance.now()
  };
  const nestedSuite = state.pushSuite(suite);
  const suitePromise = (async () => {
    try {
      await Promise.resolve(callback(suite));
    } catch (error) {
      console.error(chalk8.red(`Suite failed: ${nestedSuite.fullPath}`));
      console.error(chalk8.red(error.stack));
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
    throw new Error("A test needs to belong to a suite");
  }
  const test = {
    name: params.name,
    startTime: performance.now()
  };
  const testPromise = (async () => {
    try {
      await Promise.resolve(callback());
      test.status = "passed";
      test.duration = performance.now() - test.startTime;
      state.passedTests++;
    } catch (error) {
      test.status = "failed";
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
import chalk9 from "chalk";
async function runWebTestFile(testFile, options) {
  const defaults = {
    silent: false
  };
  options ?? (options = defaults);
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
    showSummary: true
  };
  options ?? (options = defaults);
  state.resetCounters();
  state.startTimer();
  if (!options.quiet) {
    console.log(chalk9.bold.magenta(`
Running ${testFiles.length} web test file(s)`));
  }
  try {
    for (const file of testFiles) {
      await runWebTestFile(file, options);
    }
  } catch (error) {
    console.error(chalk9.red("\nTest execution failed:"));
    console.error(chalk9.red(error.stack));
  }
  const summary = {
    totalTests: state.passedTests + state.failedTests,
    passedTests: state.passedTests,
    failedTests: state.failedTests,
    executionTime: state.getExecutionTime(),
    suiteStack: state.suiteStack
  };
  if (options.showSummary) {
    state.printSummary();
  }
  return summary;
}
async function runWebTestFunction(testFn, options) {
  options ?? (options = {
    quiet: false,
    showSummary: true
  });
  state.setOptions(options);
  try {
    await Promise.resolve(testFn());
    await state.testTracker.waitForAll();
  } catch (error) {
    console.error("Error in test suite:", error);
    state.failedTests++;
  }
  if (options.showSummary) {
    state.printSummary();
  }
  return {
    passedTests: state.passedTests,
    failedTests: state.failedTests,
    suiteStack: state.suiteStack
  };
}

// src/_codi.js
var assertEqual2 = assertions_default.assertEqual;
var assertNotEqual2 = assertions_default.assertNotEqual;
var assertTrue2 = assertions_default.assertTrue;
var assertFalse2 = assertions_default.assertFalse;
var assertThrows2 = assertions_default.assertThrows;
var assertNoDuplicates2 = assertions_default.assertNoDuplicates;
var version = "v1.0.7";
export {
  assertEqual2 as assertEqual,
  assertFalse2 as assertFalse,
  assertNoDuplicates2 as assertNoDuplicates,
  assertNotEqual2 as assertNotEqual,
  assertThrows2 as assertThrows,
  assertTrue2 as assertTrue,
  describe,
  it,
  runWebTestFile,
  runWebTestFunction,
  runWebTests,
  state,
  version
};
