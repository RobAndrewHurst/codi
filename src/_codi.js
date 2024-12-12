import assertions from "./assertions/_assertions.js";

// Create the codi object to hold all exports
const codi = {
    describe: (await import('./core/describe.js')).describe,
    it: (await import('./core/it.js')).it,
    state: (await import('./state/TestState.js')).state,
    runWebTests: (await import('./runners/webRunner.js')).runWebTests,
    runWebTestFile: (await import('./runners/webRunner.js')).runWebTestFile,
    runWebTestFunction: (await import('./runners/webRunner.js')).runWebTestFunction,
    assertEqual: assertions.assertEqual,
    assertNotEqual: assertions.assertNotEqual,
    assertTrue: assertions.assertTrue,
    assertFalse: assertions.assertFalse,
    assertThrows: assertions.assertThrows,
    assertNoDuplicates: assertions.assertNoDuplicates,
    version: 'v1.0.9'
};

// Assign codi to globalThis
globalThis.codi = codi;

// Export everything individually
export const {
    describe,
    it,
    state,
    runWebTests,
    runWebTestFile,
    runWebTestFunction,
    assertEqual,
    assertNotEqual,
    assertTrue,
    assertFalse,
    assertThrows,
    assertNoDuplicates,
    version
} = codi;

// Export the entire codi object as default
export default codi;