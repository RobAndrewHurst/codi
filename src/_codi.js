import assertions from "./assertions/_assertions.js";
import { describe } from './core/describe.js';
import { it } from './core/it.js';
import { state } from './state/TestState.js';
import {
    runWebTests,
    runWebTestFile,
    runWebTestFunction
} from './runners/webRunner.js';

const version = 'v1.0.11';

// Create the codi object to hold all exports
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
    version
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
    version
};

export const {
    assertEqual,
    assertNotEqual,
    assertTrue,
    assertFalse,
    assertThrows,
    assertNoDuplicates
} = assertions;

// Export the entire codi object as default
export default codi;