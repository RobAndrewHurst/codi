import { runCLI } from "./testNodeRunner.js";
import { describe, it } from "./suite.js";
import assertions from './assertions/_assertions.js';

// Assertion functions
const assertEqual = assertions.assertEqual;
const assertNotEqual = assertions.assertNotEqual;
const assertTrue = assertions.assertTrue;
const assertFalse = assertions.assertFalse;
const assertThrows = assertions.assertThrows;

export {
  runCLI,
  describe,
  it,
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows 
};