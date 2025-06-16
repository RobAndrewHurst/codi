import assertions from './assertions/_assertions.js';
import { describe } from './core/describe.js';
import { it } from './core/it.js';
import {
  runWebTestFile,
  runWebTestFunction,
  runWebTests,
} from './runners/webRunner.js';
import { state } from './state/TestState.js';
import { codepenLogging } from './codepen/logging.js';

const version = 'v1.0.39';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Polyfill for Node.js globals in browser
if (isBrowser && typeof global === 'undefined') {
  globalThis.global = globalThis;
}

// Stub functions for Node.js-only functionality when in browser
const createStub = (name) => {
  return function(...args) {
    if (isBrowser) {
      console.warn(`${name} is not available in browser environment`);
      return Promise.resolve();
    }
    throw new Error(`${name} should only be called in Node.js environment`);
  };
};

// Browser-safe exports - these will be replaced with actual implementations in Node.js
let runTestFunction = createStub('runTestFunction');
let runBrowserTests = createStub('runBrowserTests');
let runBrowserTestFile = createStub('runBrowserTestFile');  
let runBrowserTestFunction = createStub('runBrowserTestFunction');
let mock = null;
let mockHttp = null;

// Dynamic import for Node.js-specific functionality
// This is wrapped in a try-catch and only executed in Node.js environment
if (!isBrowser) {
  // Use dynamic import in an async context to avoid blocking esm.sh
  (async () => {
    try {
      // Import Node.js test runner
      const { runTestFunction: nodeTestFunction } = await import('./runners/nodeRunner.js');
      runTestFunction = nodeTestFunction;
      
      // Import browser test runner (only available in Node.js)
      const browserRunner = await import('./runners/browserRunner.js');
      runBrowserTests = browserRunner.runBrowserTests;
      runBrowserTestFile = browserRunner.runBrowserTestFile;
      runBrowserTestFunction = browserRunner.runBrowserTestFunction;
      
      // Import Node.js mocking utilities
      const { mock: nodeMock } = await import('node:test');
      const { MockAgent, setGlobalDispatcher } = await import('undici');
      const httpMocks = await import('node-mocks-http');
      
      mock = nodeMock;
      mockHttp = {
        MockAgent,
        setGlobalDispatcher,
        createRequest: httpMocks.createRequest,
        createResponse: httpMocks.createResponse,
        createMocks: httpMocks.createMocks,
      };
      
      // Update the codi object with the actual implementations
      Object.assign(codi, {
        runTestFunction,
        runBrowserTests,
        runBrowserTestFile,
        runBrowserTestFunction,
        mock,
        mockHttp,
      });
      
    } catch (error) {
      // Silently fail if Node.js modules aren't available
      // This allows the package to work in browser environments
      console.warn('Some Node.js-specific features are not available:', error.message);
    }
  })();
}

// Create the main codi object with browser-compatible defaults
const codi = {
  // Core testing functions (available everywhere)
  describe,
  it,
  state,
  
  // Web testing functions (available everywhere)
  runWebTests,
  runWebTestFile,
  runWebTestFunction,
  
  // Assertion functions (available everywhere)
  assertEqual: assertions.assertEqual,
  assertNotEqual: assertions.assertNotEqual,
  assertTrue: assertions.assertTrue,
  assertFalse: assertions.assertFalse,
  assertThrows: assertions.assertThrows,
  assertNoDuplicates: assertions.assertNoDuplicates,
  
  // Utility functions
  version,
  codepenLogging,
  
  // Node.js-specific functions (stubs in browser, real implementations in Node.js)
  runTestFunction,
  runBrowserTests,
  runBrowserTestFile,
  runBrowserTestFunction,
  mock,
  mockHttp,
};

// Make codi available globally
if (typeof globalThis !== 'undefined') {
  globalThis.codi = codi;
}

// Export everything individually for named imports
export {
  describe,
  it,
  state,
  runWebTests,
  runWebTestFile,
  runWebTestFunction,
  runTestFunction,
  runBrowserTests,
  runBrowserTestFile,
  runBrowserTestFunction,
  version,
  codepenLogging,
};

// Export assertion functions
export const {
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  assertNoDuplicates,
} = assertions;

// Export the main codi object as default
export default codi;
export { codi };