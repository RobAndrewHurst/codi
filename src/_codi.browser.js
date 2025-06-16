import assertions from './assertions/_assertions.js';
import { codepenLogging } from './codepen/logging.js';
import { describe } from './core/describe.js';
import { it } from './core/it.js';
import {
  runWebTestFile,
  runWebTestFunction,
  runWebTests,
} from './runners/webRunner.js';
import { state } from './state/TestState.js';

const version = 'v1.0.40-beta';

// Create the browser-specific codi object (no Node.js dependencies)
const codi = {
  describe,
  it,
  state,
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
};

// Assign codi to globalThis for browser access
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
export { codi };
export default codi;
