import assertions from './assertions/_assertions.js';
import { describe } from './core/describe.js';
import { it } from './core/it.js';
import { state } from './state/TestState.js';
import {
  runWebTests,
  runWebTestFile,
  runWebTestFunction,
} from './runners/webRunner.js';

import { runTestFunction } from './testRunner.js';

import { codepenLogging } from './codepen/logging.js';

import { MockHttp } from './util/mockHtml.js';

import { MockModuleRegistry } from './util/mockModule.js';

const version = 'v1.0.22';

// Create the codi object to hold all exports
const codi = {
  describe,
  it,
  state,
  runTestFunction,
  runWebTests,
  runWebTestFile,
  runWebTestFunction,
  assertEqual: assertions.assertEqual,
  assertNotEqual: assertions.assertNotEqual,
  assertTrue: assertions.assertTrue,
  assertFalse: assertions.assertFalse,
  assertThrows: assertions.assertThrows,
  assertNoDuplicates: assertions.assertNoDuplicates,
  version,
  codepenLogging,
  MockHttp,
  MockModuleRegistry,
};

// Assign codi to globalThis
globalThis.codi = codi;

// Export everything individually
export {
  describe,
  it,
  state,
  runWebTests,
  runWebTestFile,
  runWebTestFunction,
  version,
  codepenLogging,
};

export const {
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  assertNoDuplicates,
} = assertions;

// Export the entire codi object as default
export default codi;
