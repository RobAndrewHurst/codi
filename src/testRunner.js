import { runCLI } from "./testNodeRunner.js";
import { testBrowser } from "./browserTestRunner.js";
import { describe, it } from "./suite.js";
import assertions from './assertions/_assertions.js';

global.PASSED_TESTS = 0;
global.FAILED_TESTS = 0;

// Assertion functions
const assertEqual = assertions.assertEqual;
const assertNotEqual = assertions.assertNotEqual;
const assertTrue = assertions.assertTrue;
const assertFalse = assertions.assertFalse;
const assertThrows = assertions.assertThrows;

const isBrowser = process.argv[3] === '--browser';

const run = isBrowser ? testBrowser : runCLI;

export {
  run,
  describe,
  it,
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows
};