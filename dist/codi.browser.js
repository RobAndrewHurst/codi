/**
 * Codi Test Framework - Browser Bundle
 * Version: v1.0.39-beta
 * Generated: 2026-02-26T09:52:23.294Z
 * Build tool: esbuild
 * 
 * @license MIT
 */
"use strict";
var codi = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/_codi.browser.js
  var codi_browser_exports = {};
  __export(codi_browser_exports, {
    assertCloseTo: () => assertCloseTo2,
    assertContains: () => assertContains2,
    assertDeepContains: () => assertDeepContains2,
    assertEqual: () => assertEqual2,
    assertFalse: () => assertFalse2,
    assertInstanceOf: () => assertInstanceOf2,
    assertLength: () => assertLength2,
    assertMatch: () => assertMatch2,
    assertNoDuplicates: () => assertNoDuplicates2,
    assertNotContains: () => assertNotContains2,
    assertNotEqual: () => assertNotEqual2,
    assertThrows: () => assertThrows2,
    assertTrue: () => assertTrue2,
    assertType: () => assertType2,
    codepenLogging: () => codepenLogging,
    codi: () => codi,
    default: () => codi_browser_default,
    describe: () => describe,
    it: () => it,
    runWebTestFile: () => runWebTestFile,
    runWebTestFunction: () => runWebTestFunction,
    runWebTests: () => runWebTests,
    state: () => state,
    version: () => version
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
      underline: (text) => text
    },
    underline: (text) => text
  };

  // src/assertions/assertCloseTo.js
  function assertCloseTo(actual, expected, delta, message) {
    if (typeof actual !== "number" || typeof expected !== "number" || typeof delta !== "number") {
      throw new Error("assertCloseTo() expects numeric arguments");
    }
    if (Math.abs(actual - expected) > delta) {
      throw new Error(
        message || `Expected ${chalk_browser_stub_default.bold.yellow(actual)} to be within ${chalk_browser_stub_default.bold.yellow(delta)} of ${chalk_browser_stub_default.bold.yellow(expected)}`
      );
    }
  }

  // src/assertions/assertContains.js
  function assertContains(haystack, needle, message) {
    if (typeof haystack === "string") {
      if (!haystack.includes(needle)) {
        throw new Error(
          message || `Expected string to contain ${chalk_browser_stub_default.bold.yellow(JSON.stringify(needle))}`
        );
      }
    } else if (Array.isArray(haystack)) {
      if (!haystack.includes(needle)) {
        throw new Error(
          message || `Expected array to contain ${chalk_browser_stub_default.bold.yellow(JSON.stringify(needle))}`
        );
      }
    } else {
      throw new Error(
        "assertContains() expects a string or array as the first argument"
      );
    }
  }

  // src/util/deepEqual.js
  function isDeepEqual(a, b) {
    return _isDeepEqual(a, b, /* @__PURE__ */ new Map());
  }
  function _isDeepEqual(a, b, seen) {
    if (Object.is(a, b)) {
      return true;
    }
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
      return false;
    }
    if (a.constructor !== b.constructor) {
      return false;
    }
    if (seen.has(a)) {
      return seen.get(a) === b;
    }
    seen.set(a, b);
    if (a instanceof Date) {
      return a.getTime() === b.getTime();
    }
    if (a instanceof RegExp) {
      return a.source === b.source && a.flags === b.flags;
    }
    if (a instanceof Map) {
      if (a.size !== b.size)
        return false;
      for (const [key, val] of a) {
        if (!b.has(key) || !_isDeepEqual(val, b.get(key), seen)) {
          return false;
        }
      }
      return true;
    }
    if (a instanceof Set) {
      if (a.size !== b.size)
        return false;
      for (const val of a) {
        if (!b.has(val)) {
          let found = false;
          for (const bVal of b) {
            if (_isDeepEqual(val, bVal, seen)) {
              found = true;
              break;
            }
          }
          if (!found)
            return false;
        }
      }
      return true;
    }
    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++) {
        if (!Object.is(a[i], b[i]))
          return false;
      }
      return true;
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++) {
        if (!_isDeepEqual(a[i], b[i], seen))
          return false;
      }
      return true;
    }
    const keysA = Reflect.ownKeys(a);
    const keysB = Reflect.ownKeys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (!_isDeepEqual(a[key], b[key], seen)) {
        return false;
      }
    }
    return true;
  }

  // src/assertions/assertDeepContains.js
  function assertDeepContains(obj, subset, message) {
    if (typeof obj !== "object" || obj === null) {
      throw new Error(
        "assertDeepContains() expects an object as the first argument"
      );
    }
    if (typeof subset !== "object" || subset === null) {
      throw new Error(
        "assertDeepContains() expects an object as the second argument"
      );
    }
    for (const key of Object.keys(subset)) {
      if (!(key in obj)) {
        throw new Error(
          message || `Expected object to contain key ${chalk_browser_stub_default.bold.yellow(JSON.stringify(key))}`
        );
      }
      if (!isDeepEqual(obj[key], subset[key])) {
        throw new Error(
          message || `Expected obj.${key} to deeply equal ${chalk_browser_stub_default.bold.yellow(JSON.stringify(subset[key]))}, but got ${chalk_browser_stub_default.bold.yellow(JSON.stringify(obj[key]))}`
        );
      }
    }
  }

  // src/util/diff.js
  function generateDiff(actual, expected, path = "") {
    const diffs = [];
    if (typeof actual !== typeof expected) {
      diffs.push(
        `  ${path || "(root)"}: typeof ${typeof actual} !== typeof ${typeof expected}`
      );
      return diffs;
    }
    if (actual === null || expected === null || typeof actual !== "object") {
      if (!Object.is(actual, expected)) {
        diffs.push(
          `  ${path || "(root)"}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`
        );
      }
      return diffs;
    }
    if (Array.isArray(actual) || Array.isArray(expected)) {
      if (!Array.isArray(actual) || !Array.isArray(expected)) {
        diffs.push(`  ${path || "(root)"}: one is an array, the other is not`);
        return diffs;
      }
      const maxLen = Math.max(actual.length, expected.length);
      for (let i = 0; i < maxLen; i++) {
        const itemPath = `${path}[${i}]`;
        if (i >= actual.length) {
          diffs.push(`  ${itemPath}: missing in actual`);
        } else if (i >= expected.length) {
          diffs.push(`  ${itemPath}: unexpected in actual`);
        } else {
          diffs.push(...generateDiff(actual[i], expected[i], itemPath));
        }
      }
      return diffs;
    }
    const allKeys = /* @__PURE__ */ new Set([...Object.keys(actual), ...Object.keys(expected)]);
    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : `.${key}`;
      if (!(key in actual)) {
        diffs.push(`  ${keyPath}: missing in actual`);
      } else if (!(key in expected)) {
        diffs.push(`  ${keyPath}: unexpected in actual (not in expected)`);
      } else {
        diffs.push(...generateDiff(actual[key], expected[key], keyPath));
      }
    }
    return diffs;
  }
  function formatDiff(actual, expected) {
    const diffs = generateDiff(actual, expected);
    if (diffs.length === 0) {
      return "  (no differences found)";
    }
    const limited = diffs.slice(0, 10);
    let result = limited.join("\n");
    if (diffs.length > 10) {
      result += `
  ... and ${diffs.length - 10} more difference(s)`;
    }
    return result;
  }

  // src/assertions/assertEqual.js
  function assertEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected)) {
      if (typeof actual === "object" && actual !== null && typeof expected === "object" && expected !== null) {
        const diff = formatDiff(actual, expected);
        throw new Error(
          message || `Expected objects to be deeply equal.
Differences:
${diff}`
        );
      }
      throw new Error(
        message || `Expected ${chalk_browser_stub_default.bold.yellow(JSON.stringify(actual))} to deeply equal ${chalk_browser_stub_default.bold.yellow(JSON.stringify(expected))}`
      );
    }
  }

  // src/assertions/assertFalse.js
  function assertFalse(actual, message) {
    if (actual !== false) {
      throw new Error(
        message || `Expected ${chalk_browser_stub_default.bold.yellow(actual)} to be false`
      );
    }
  }

  // src/assertions/assertInstanceOf.js
  function assertInstanceOf(value, Constructor, message) {
    var _a;
    if (typeof Constructor !== "function") {
      throw new Error(
        "assertInstanceOf() expects a constructor function as the second argument"
      );
    }
    if (!(value instanceof Constructor)) {
      const actualType = ((_a = value == null ? void 0 : value.constructor) == null ? void 0 : _a.name) || typeof value;
      throw new Error(
        message || `Expected instance of ${chalk_browser_stub_default.bold.yellow(Constructor.name)}, but got ${chalk_browser_stub_default.bold.yellow(actualType)}`
      );
    }
  }

  // src/assertions/assertLength.js
  function assertLength(value, length, message) {
    if (value == null || typeof value.length !== "number") {
      throw new Error(
        "assertLength() expects an array or string as the first argument"
      );
    }
    if (value.length !== length) {
      throw new Error(
        message || `Expected length ${chalk_browser_stub_default.bold.yellow(length)}, but got ${chalk_browser_stub_default.bold.yellow(value.length)}`
      );
    }
  }

  // src/assertions/assertMatch.js
  function assertMatch(value, regex, message) {
    if (!(regex instanceof RegExp)) {
      throw new Error("assertMatch() expects a RegExp as the second argument");
    }
    if (!regex.test(value)) {
      throw new Error(
        message || `Expected ${chalk_browser_stub_default.bold.yellow(JSON.stringify(value))} to match ${chalk_browser_stub_default.bold.yellow(String(regex))}`
      );
    }
  }

  // src/assertions/assertNoDuplicates.js
  function assertNoDuplicates(arr, message) {
    arr = arr.filter((item, index) => arr.indexOf(item) !== index);
    if (arr.length > 0) {
      throw new Error(message || `Duplicates found: ${chalk_browser_stub_default.bold.yellow(arr)}`);
    }
  }

  // src/assertions/assertNotContains.js
  function assertNotContains(haystack, needle, message) {
    if (typeof haystack === "string") {
      if (haystack.includes(needle)) {
        throw new Error(
          message || `Expected string to NOT contain ${chalk_browser_stub_default.bold.yellow(JSON.stringify(needle))}`
        );
      }
    } else if (Array.isArray(haystack)) {
      if (haystack.includes(needle)) {
        throw new Error(
          message || `Expected array to NOT contain ${chalk_browser_stub_default.bold.yellow(JSON.stringify(needle))}`
        );
      }
    } else {
      throw new Error(
        "assertNotContains() expects a string or array as the first argument"
      );
    }
  }

  // src/assertions/assertNotEqual.js
  function assertNotEqual(actual, expected, message) {
    if (isDeepEqual(actual, expected)) {
      throw new Error(
        message || `Expected ${chalk_browser_stub_default.bold.yellow(JSON.stringify(actual))} to not deeply equal ${chalk_browser_stub_default.bold.yellow(JSON.stringify(expected))}`
      );
    }
  }

  // src/assertions/assertThrows.js
  var SENTINEL = "__codi_assertThrows_sentinel__";
  async function assertThrows(callback, errorMessage, message) {
    try {
      const result = callback();
      if (result && typeof result.then === "function") {
        await result;
      }
      throw new Error(SENTINEL);
    } catch (error) {
      if (error.message === SENTINEL) {
        throw new Error(message || "Expected an error to be thrown");
      }
      if (errorMessage !== void 0 && error.message !== errorMessage) {
        throw new Error(
          message || `Expected error message to be ${chalk_browser_stub_default.bold.yellow(errorMessage)}, but got ${chalk_browser_stub_default.bold.yellow(error.message)}`
        );
      }
    }
  }

  // src/assertions/assertTrue.js
  function assertTrue(actual, message) {
    if (actual !== true) {
      throw new Error(
        message || `Expected ${chalk_browser_stub_default.bold.yellow(actual)} to be true`
      );
    }
  }

  // src/assertions/assertType.js
  function assertType(value, type, message) {
    if (typeof value !== type) {
      throw new Error(
        message || `Expected typeof ${chalk_browser_stub_default.bold.yellow(type)}, but got ${chalk_browser_stub_default.bold.yellow(typeof value)}`
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
    assertContains,
    assertNotContains,
    assertMatch,
    assertInstanceOf,
    assertCloseTo,
    assertDeepContains,
    assertType,
    assertLength
  };

  // src/codepen/logging.js
  function codepenLogging() {
    var following = false, pre = document.createElement("pre"), code = document.createElement("code");
    pre.appendChild(code);
    document.body.appendChild(pre);
    var originalConsole = {
      log: window.console.log,
      info: window.console.info,
      warn: window.console.warn,
      error: window.console.error
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
      let s = objects.map((obj) => {
        if (typeof obj === "string") {
          return obj;
        } else {
          try {
            return JSON.stringify(obj);
          } catch (e) {
            return String(obj);
          }
        }
      }).join(" ");
      s = s.replace(/\[\d{1,2}m/g, "");
      var span = document.createElement("span"), text = document.createTextNode(s + "\n");
      span.setAttribute("class", className);
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
      log: function(...args) {
        print("debug", ...args);
        originalConsole.log(...args);
      },
      info: function(...args) {
        print("info", ...args);
        originalConsole.info(...args);
      },
      warn: function(...args) {
        print("warn", ...args);
        originalConsole.warn(...args);
      },
      error: function(...args) {
        print("error", ...args);
        originalConsole.error(...args);
      }
    };
    return window.console;
  }

  // src/reporters/consoleReporter.js
  var consoleReporter = {
    name: "console",
    /**
     * Called once after all tests have run.
     * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
     * @param {object} options - Runtime options (quiet, etc.)
     */
    report(results, options = {}) {
      const {
        suiteStack,
        passedTests,
        failedTests,
        skippedTests,
        executionTime
      } = results;
      for (const id of Object.keys(suiteStack)) {
        printSuite(suiteStack[id], 0, options);
      }
      console.log(chalk_browser_stub_default.bold.cyan("\nTest Summary:"));
      console.log(chalk_browser_stub_default.green(`  Passed: ${passedTests}`));
      console.log(chalk_browser_stub_default.red(`  Failed: ${failedTests}`));
      if (skippedTests > 0) {
        console.log(chalk_browser_stub_default.yellow(`  Skipped: ${skippedTests}`));
      }
      console.log(chalk_browser_stub_default.blue(`  Time: ${executionTime}s`));
    }
  };
  function hasFailingTests(suite) {
    var _a;
    if ((_a = suite.tests) == null ? void 0 : _a.some((test) => test.status === "failed")) {
      return true;
    }
    if (suite.children) {
      return suite.children.some((child) => hasFailingTests(child));
    }
    return false;
  }
  function printSuite(suite, indent, options) {
    var _a;
    const indentation = "  ".repeat(indent);
    let results = suite.tests;
    let hasFailingChildren = false;
    if (options.quiet) {
      results = results.filter((result) => result.status === "failed");
    }
    if (suite.children) {
      hasFailingChildren = suite.children.some((child) => hasFailingTests(child));
    }
    if (suite.children.length > 0 && hasFailingChildren || results.length > 0) {
      console.log("\n" + indentation + chalk_browser_stub_default.yellow(chalk_browser_stub_default.bold(suite.name)));
    }
    for (const result of results) {
      if (result.status === "failed") {
        console.log(
          indentation + chalk_browser_stub_default.red(`  \u2514\u2500 \u26D4 ${result.name} (${result.duration.toFixed(2)}ms)`)
        );
        const errorMessage = ((_a = result.error) == null ? void 0 : _a.message) ? result.error.message : "Unknown error";
        console.log(indentation + chalk_browser_stub_default.red(`     ${errorMessage}`));
      } else if (result.status === "skipped") {
        if (!options.quiet) {
          console.log(
            indentation + chalk_browser_stub_default.yellow(`  \u2514\u2500 \u23ED  ${result.name} (skipped)`)
          );
        }
      } else {
        console.log(
          indentation + chalk_browser_stub_default.green(
            `  \u2514\u2500 \u2705 ${result.name} (${result.duration.toFixed(2)}ms)`
          )
        );
      }
    }
    if (suite.children) {
      for (const child of suite.children) {
        printSuite(child, indent + 1, options);
      }
    }
  }

  // src/reporters/dotReporter.js
  var dotReporter = {
    name: "dot",
    /**
     * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
     */
    report(results) {
      var _a;
      const {
        suiteStack,
        passedTests,
        failedTests,
        skippedTests,
        executionTime
      } = results;
      const tests = collectTests(suiteStack);
      const failures = [];
      const chars = [];
      for (const { suiteName, test } of tests) {
        if (test.status === "failed") {
          chars.push(chalk_browser_stub_default.red("F"));
          failures.push({ suiteName, test });
        } else if (test.status === "skipped") {
          chars.push(chalk_browser_stub_default.yellow("S"));
        } else {
          chars.push(chalk_browser_stub_default.green("."));
        }
      }
      const line = chars.join("");
      const rawLine = tests.map(
        (t) => t.test.status === "failed" ? "F" : t.test.status === "skipped" ? "S" : "."
      ).join("");
      for (let i = 0; i < chars.length; i += 80) {
        console.log(chars.slice(i, i + 80).join(""));
      }
      console.log("");
      if (failures.length > 0) {
        console.log(chalk_browser_stub_default.red("\nFailures:\n"));
        for (let i = 0; i < failures.length; i++) {
          const { suiteName, test } = failures[i];
          console.log(chalk_browser_stub_default.red(`  ${i + 1}) ${suiteName} > ${test.name}`));
          const msg = ((_a = test.error) == null ? void 0 : _a.message) || "Unknown error";
          console.log(chalk_browser_stub_default.red(`     ${msg}`));
          console.log("");
        }
      }
      const total = passedTests + failedTests + skippedTests;
      const parts = [];
      parts.push(chalk_browser_stub_default.green(`${passedTests} passing`));
      if (failedTests > 0)
        parts.push(chalk_browser_stub_default.red(`${failedTests} failing`));
      if (skippedTests > 0)
        parts.push(chalk_browser_stub_default.yellow(`${skippedTests} skipped`));
      parts.push(chalk_browser_stub_default.blue(`(${executionTime}s)`));
      console.log(parts.join(", "));
    }
  };
  function collectTests(suiteStack) {
    const tests = [];
    function visit(suite) {
      for (const test of suite.tests) {
        tests.push({ suiteName: suite.name, test });
      }
      if (suite.children) {
        for (const child of suite.children) {
          visit(child);
        }
      }
    }
    for (const suite of Object.values(suiteStack)) {
      visit(suite);
    }
    return tests;
  }

  // src/reporters/jsonReporter.js
  var jsonReporter = {
    name: "json",
    /**
     * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
     */
    report(results) {
      const {
        suiteStack,
        passedTests,
        failedTests,
        skippedTests,
        executionTime
      } = results;
      const output = {
        stats: {
          passed: passedTests,
          failed: failedTests,
          skipped: skippedTests,
          total: passedTests + failedTests + skippedTests,
          duration: executionTime
        },
        suites: flattenSuites(suiteStack)
      };
      console.log(JSON.stringify(output, null, 2));
    }
  };
  function flattenSuites(suiteStack) {
    const suites = [];
    function visit(suite) {
      suites.push({
        name: suite.name,
        id: suite.id,
        parentId: suite.parentId || null,
        duration: suite.duration,
        tests: suite.tests.map((t) => ({
          name: t.name,
          status: t.status,
          duration: t.duration,
          error: t.error ? { message: t.error.message, stack: t.error.stack } : null
        }))
      });
      if (suite.children) {
        for (const child of suite.children) {
          visit(child);
        }
      }
    }
    for (const suite of Object.values(suiteStack)) {
      visit(suite);
    }
    return suites;
  }

  // src/reporters/junitReporter.js
  var junitReporter = {
    name: "junit",
    /**
     * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
     */
    report(results) {
      const {
        suiteStack,
        passedTests,
        failedTests,
        skippedTests,
        executionTime
      } = results;
      const total = passedTests + failedTests + skippedTests;
      const lines = [];
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push(
        `<testsuites tests="${total}" failures="${failedTests}" skipped="${skippedTests}" time="${executionTime}">`
      );
      for (const suite of Object.values(suiteStack)) {
        visitSuite(suite, lines);
      }
      lines.push("</testsuites>");
      console.log(lines.join("\n"));
    }
  };
  function visitSuite(suite, lines) {
    var _a, _b;
    const tests = suite.tests;
    const failures = tests.filter((t) => t.status === "failed").length;
    const skipped = tests.filter((t) => t.status === "skipped").length;
    const suiteDuration = suite.duration != null ? (suite.duration / 1e3).toFixed(3) : "0.000";
    lines.push(
      `  <testsuite name="${escapeXml(suite.name)}" tests="${tests.length}" failures="${failures}" skipped="${skipped}" time="${suiteDuration}">`
    );
    for (const test of tests) {
      const duration = test.duration != null ? (test.duration / 1e3).toFixed(3) : "0.000";
      lines.push(
        `    <testcase name="${escapeXml(test.name)}" classname="${escapeXml(suite.name)}" time="${duration}">`
      );
      if (test.status === "failed") {
        const msg = ((_a = test.error) == null ? void 0 : _a.message) || "Unknown error";
        const stack = ((_b = test.error) == null ? void 0 : _b.stack) || "";
        lines.push(
          `      <failure message="${escapeXml(msg)}">${escapeXml(stack)}</failure>`
        );
      } else if (test.status === "skipped") {
        lines.push("      <skipped/>");
      }
      lines.push("    </testcase>");
    }
    lines.push("  </testsuite>");
    if (suite.children) {
      for (const child of suite.children) {
        visitSuite(child, lines);
      }
    }
  }
  function escapeXml(str) {
    if (!str)
      return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  // src/reporters/tapReporter.js
  var tapReporter = {
    name: "tap",
    /**
     * @param {object} results - { suiteStack, passedTests, failedTests, skippedTests, executionTime }
     */
    report(results) {
      const { suiteStack } = results;
      const tests = collectTests2(suiteStack);
      console.log("TAP version 13");
      console.log(`1..${tests.length}`);
      let i = 1;
      for (const { suiteName, test } of tests) {
        const fullName = `${suiteName} > ${test.name}`;
        if (test.status === "skipped") {
          console.log(`ok ${i} - ${fullName} # SKIP`);
        } else if (test.status === "failed") {
          console.log(`not ok ${i} - ${fullName}`);
          if (test.error) {
            console.log("  ---");
            console.log(`  message: ${test.error.message || "Unknown error"}`);
            if (test.error.stack) {
              console.log(`  stack: |`);
              for (const line of test.error.stack.split("\n")) {
                console.log(`    ${line}`);
              }
            }
            console.log("  ...");
          }
        } else {
          console.log(`ok ${i} - ${fullName}`);
        }
        i++;
      }
    }
  };
  function collectTests2(suiteStack) {
    const tests = [];
    function visit(suite) {
      for (const test of suite.tests) {
        tests.push({ suiteName: suite.name, test });
      }
      if (suite.children) {
        for (const child of suite.children) {
          visit(child);
        }
      }
    }
    for (const suite of Object.values(suiteStack)) {
      visit(suite);
    }
    return tests;
  }

  // src/reporters/index.js
  var reporters = {
    console: consoleReporter,
    json: jsonReporter,
    junit: junitReporter,
    tap: tapReporter,
    dot: dotReporter
  };
  function getReporter(name = "console") {
    const reporter = reporters[name];
    if (!reporter) {
      const available = Object.keys(reporters).join(", ");
      throw new Error(
        `Unknown reporter "${name}". Available reporters: ${available}`
      );
    }
    return reporter;
  }

  // src/state/TestState.js
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
      this.skippedTests = 0;
      this.suiteStack = {};
      this.startTime = null;
      this.options = {};
      this.hasOnly = false;
      this.contextStack = [];
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
      return this.contextStack.length > 0 ? this.contextStack[this.contextStack.length - 1] : void 0;
    }
    setOptions(options) {
      this.options = __spreadValues(__spreadValues({}, this.options), options);
      if (options.grep) {
        const regexMatch = options.grep.match(/^\/(.+)\/([gimsuy]*)$/);
        if (regexMatch) {
          this._grepPattern = new RegExp(regexMatch[1], regexMatch[2]);
        } else {
          this._grepPattern = new RegExp(options.grep, "i");
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
      if (!this._grepPattern)
        return true;
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
      return ((performance.now() - this.startTime) / 1e3).toFixed(2);
    }
    /**
     * Add a new suite to the stack and register it.
     * @method
     * @param {object} suite - Test suite to add
     * @returns {object} The nested suite object with hooks and metadata
     */
    pushSuite(suite) {
      let parentSuite = "";
      if (suite.parentId) {
        parentSuite = this.getSuite(suite.parentId);
      } else {
        if (this.suiteStack[suite.id]) {
          console.warn(
            chalk_browser_stub_default.yellow(`There is already a Suite with the ID: ${suite.id}`)
          );
          suite.id = suite.name + suite.id;
        }
      }
      const nestedSuite = __spreadProps(__spreadValues({}, suite), {
        children: [],
        tests: [],
        beforeAll: [],
        afterAll: [],
        beforeEach: [],
        afterEach: [],
        parent: parentSuite || null
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
      const reporterName = this.options.reporter || "console";
      const reporter = getReporter(reporterName);
      reporter.report(
        {
          suiteStack: this.suiteStack,
          passedTests: this.passedTests,
          failedTests: this.failedTests,
          skippedTests: this.skippedTests,
          executionTime: this.getExecutionTime()
        },
        this.options
      );
    }
  };
  var state = new TestState();

  // src/core/describe.js
  function normalizeParams(params) {
    if (typeof params === "string") {
      return {
        name: params,
        id: state.generateId(),
        parentId: state.currentContext()
      };
    }
    return {
      name: params.name,
      id: params.id,
      parentId: params.parentId
    };
  }
  async function describe(params, callback) {
    if (!params || typeof params === "object" && !params.name) {
      throw new Error('describe() requires a "name" parameter');
    }
    if (typeof params === "object" && !params.id) {
      throw new Error('describe() requires an "id" parameter');
    }
    if (typeof callback !== "function") {
      throw new Error("describe() requires a callback function");
    }
    const normalized = normalizeParams(params);
    const suite = __spreadProps(__spreadValues({}, normalized), {
      startTime: performance.now()
    });
    const nestedSuite = state.pushSuite(suite);
    const suiteApi = __spreadProps(__spreadValues({}, suite), {
      beforeAll(fn) {
        nestedSuite.beforeAll.push(fn);
      },
      afterAll(fn) {
        nestedSuite.afterAll.push(fn);
      },
      beforeEach(fn) {
        nestedSuite.beforeEach.push(fn);
      },
      afterEach(fn) {
        nestedSuite.afterEach.push(fn);
      }
    });
    const suitePromise = (async () => {
      state.pushContext(suite.id);
      try {
        for (const hook of nestedSuite.beforeAll) {
          await Promise.resolve(hook());
        }
        await Promise.resolve(callback(suiteApi));
        for (const hook of nestedSuite.afterAll) {
          await Promise.resolve(hook());
        }
      } catch (error) {
        console.error(chalk_browser_stub_default.red(`Suite failed: ${nestedSuite.name}`));
        console.error(chalk_browser_stub_default.red(error.stack));
        state.failedTests++;
        state.addTestToSuite(nestedSuite, {
          name: `Suite setup error: ${nestedSuite.name}`,
          status: "failed",
          error,
          duration: performance.now() - suite.startTime
        });
      } finally {
        state.popContext();
        nestedSuite.duration = performance.now() - nestedSuite.startTime;
      }
    })();
    state.testTracker.addTest(suitePromise);
    return suitePromise;
  }
  describe.skip = async function describeSkip(params, callback) {
    if (!params || typeof params === "object" && !params.name && typeof params !== "string") {
      throw new Error('describe.skip() requires a "name" parameter');
    }
    const normalized = typeof params === "string" ? {
      name: params,
      id: state.generateId(),
      parentId: state.currentContext()
    } : { name: params.name, id: params.id, parentId: params.parentId };
    if (typeof params === "object" && !params.id) {
      throw new Error('describe.skip() requires an "id" parameter');
    }
    const suite = __spreadProps(__spreadValues({}, normalized), { startTime: performance.now() });
    const nestedSuite = state.pushSuite(suite);
    nestedSuite.skipped = true;
    nestedSuite.duration = 0;
    state.skippedTests++;
    state.addTestToSuite(nestedSuite, {
      name: `(entire suite skipped)`,
      status: "skipped",
      duration: 0
    });
  };
  describe.only = async function describeOnly(params, callback) {
    state.hasOnly = true;
    if (typeof params === "object") {
      params._only = true;
    }
    return describe(params, callback);
  };

  // src/core/it.js
  function normalizeParams2(params) {
    if (typeof params === "string") {
      const parentId = state.currentContext();
      if (!parentId) {
        throw new Error(
          `it("${params}") was called outside of a describe() block. Use the implicit nesting style by placing it() inside describe().`
        );
      }
      return { name: params, parentId };
    }
    return {
      name: params.name,
      parentId: params.parentId,
      timeout: params.timeout
    };
  }
  async function it(params, callback) {
    var _a, _b;
    if (!params || typeof params === "object" && !params.name) {
      throw new Error('it() requires a "name" parameter');
    }
    if (typeof params === "object" && !params.parentId) {
      throw new Error('it() requires a "parentId" parameter');
    }
    if (typeof callback !== "function") {
      throw new Error("it() requires a callback function");
    }
    const normalized = normalizeParams2(params);
    const suite = state.getSuite(normalized.parentId);
    if (!suite) {
      throw new Error(
        `test: "${normalized.name}" needs to belong to a suite. No suite found with id "${normalized.parentId}"`
      );
    }
    if (!state.matchesGrep(normalized.name)) {
      state.skippedTests++;
      state.addTestToSuite(suite, {
        name: normalized.name,
        status: "skipped",
        duration: 0
      });
      return;
    }
    const test = {
      name: normalized.name,
      startTime: performance.now()
    };
    const timeout = (_b = (_a = normalized.timeout) != null ? _a : state.options.timeout) != null ? _b : 5e3;
    const testPromise = (async () => {
      try {
        const beforeHooks = state.collectBeforeEach(suite);
        for (const hook of beforeHooks) {
          await Promise.resolve(hook());
        }
        await Promise.race([
          Promise.resolve(callback()),
          new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error(`Test timed out after ${timeout}ms`)),
              timeout
            );
          })
        ]);
        test.status = "passed";
        test.duration = performance.now() - test.startTime;
        state.passedTests++;
      } catch (error) {
        test.status = "failed";
        test.error = error;
        test.duration = performance.now() - test.startTime;
        state.failedTests++;
      } finally {
        try {
          const afterHooks = state.collectAfterEach(suite);
          for (const hook of afterHooks) {
            await Promise.resolve(hook());
          }
        } catch (hookError) {
          if (test.status === "passed") {
            test.status = "failed";
            test.error = hookError;
            state.passedTests--;
            state.failedTests++;
          }
        }
        state.addTestToSuite(suite, test);
      }
    })();
    state.testTracker.addTest(testPromise);
    return testPromise;
  }
  it.skip = async function itSkip(params, callback) {
    if (!params || typeof params === "object" && !params.name && typeof params !== "string") {
      throw new Error('it.skip() requires a "name" parameter');
    }
    const normalized = typeof params === "string" ? { name: params, parentId: state.currentContext() } : { name: params.name, parentId: params.parentId };
    if (!normalized.parentId) {
      throw new Error(
        'it.skip() requires a "parentId" parameter or must be inside a describe() block'
      );
    }
    const suite = state.getSuite(normalized.parentId);
    if (!suite) {
      throw new Error(
        `test: "${normalized.name}" needs to belong to a suite. No suite found with id "${normalized.parentId}"`
      );
    }
    state.skippedTests++;
    state.addTestToSuite(suite, {
      name: normalized.name,
      status: "skipped",
      duration: 0
    });
  };
  it.only = async function itOnly(params, callback) {
    state.hasOnly = true;
    if (typeof params === "object") {
      params._only = true;
    }
    return it(params, callback);
  };

  // src/runners/webRunner.js
  async function runWebTestFile(testFile, options) {
    const defaults = {
      silent: false
    };
    options != null ? options : options = defaults;
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
    options != null ? options : options = defaults;
    state.resetCounters();
    state.startTimer();
    if (!options.quiet) {
      console.log(
        chalk_browser_stub_default.bold.magenta(`
Running ${testFiles.length} web test file(s)`)
      );
    }
    try {
      for (const file of testFiles) {
        await runWebTestFile(file, options);
      }
    } catch (error) {
      console.error(chalk_browser_stub_default.red("\nTest execution failed:"));
      console.error(chalk_browser_stub_default.red(error.stack));
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
    options != null ? options : options = {
      quiet: false,
      showSummary: true
    };
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

  // src/version.js
  var version = "v1.0.39";

  // src/_codi.browser.js
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
    assertContains: assertions_default.assertContains,
    assertNotContains: assertions_default.assertNotContains,
    assertMatch: assertions_default.assertMatch,
    assertInstanceOf: assertions_default.assertInstanceOf,
    assertCloseTo: assertions_default.assertCloseTo,
    assertDeepContains: assertions_default.assertDeepContains,
    assertType: assertions_default.assertType,
    assertLength: assertions_default.assertLength,
    version,
    codepenLogging
  };
  globalThis.codi = codi;
  var {
    assertEqual: assertEqual2,
    assertNotEqual: assertNotEqual2,
    assertTrue: assertTrue2,
    assertFalse: assertFalse2,
    assertThrows: assertThrows2,
    assertNoDuplicates: assertNoDuplicates2,
    assertContains: assertContains2,
    assertNotContains: assertNotContains2,
    assertMatch: assertMatch2,
    assertInstanceOf: assertInstanceOf2,
    assertCloseTo: assertCloseTo2,
    assertDeepContains: assertDeepContains2,
    assertType: assertType2,
    assertLength: assertLength2
  } = assertions_default;
  var codi_browser_default = codi;

  // Expose functions globally for convenience
  if (typeof window !== 'undefined') {
    window.describe = codi.describe;
    window.it = codi.it;
    window.assertEqual = codi.assertEqual;
    window.assertNotEqual = codi.assertNotEqual;
    window.assertTrue = codi.assertTrue;
    window.assertFalse = codi.assertFalse;
    window.assertThrows = codi.assertThrows;
    window.assertNoDuplicates = codi.assertNoDuplicates;
    window.assertContains = codi.assertContains;
    window.assertNotContains = codi.assertNotContains;
    window.assertMatch = codi.assertMatch;
    window.assertInstanceOf = codi.assertInstanceOf;
    window.assertCloseTo = codi.assertCloseTo;
    window.assertDeepContains = codi.assertDeepContains;
    window.assertType = codi.assertType;
    window.assertLength = codi.assertLength;
  }
  return __toCommonJS(codi_browser_exports);
})();
//# sourceMappingURL=codi.browser.js.map
