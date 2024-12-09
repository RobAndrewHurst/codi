import assertions from "./assertions/_assertions.js";

// Core exports
export { describe } from './core/describe.js';
export { it } from './core/it.js';
export { state } from './state/TestState.js';

export {
    runWebTests,
    runWebTestFile,
    runWebTestFunction
} from './runners/webRunner.js';
// Assertion exports

export const assertEqual = assertions.assertEqual;
export const assertNotEqual = assertions.assertNotEqual;
export const assertTrue = assertions.assertTrue;
export const assertFalse = assertions.assertFalse;
export const assertThrows = assertions.assertThrows;
export const assertNoDuplicates = assertions.assertNoDuplicates;

export const version = 'v1.0.5'