import assertions from './assertions/_assertions.js';
import { describe } from './core/describe.js';
import { it } from './core/it.js';
import { state } from './state/TestState.js';
import {
  runWebTests,
  runWebTestFile,
  runWebTestFunction,
} from './runners/webRunner.js';
import { codepenLogging } from './codepen/logging.js';

// Check if we're in a browser environment
const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Initialize variables for Node.js specific imports
let mockHttp,
  mock,
  runTestFunction = null;

// Only import Node.js specific modules if we're not in a browser
if (!isBrowser) {
  const { mock: nodeMock } = await import('node:test');
  const { MockAgent, setGlobalDispatcher } = await import('undici');
  const httpMocks = await import('node-mocks-http');

  const { runTestFunction: nodeTestFunction } = await import(
    './runners/nodeRunner.js'
  );

  runTestFunction = nodeTestFunction;

  mock = nodeMock;
  mockHttp = {
    MockAgent,
    setGlobalDispatcher,
    createRequest: httpMocks.createRequest,
    createResponse: httpMocks.createResponse,
    createMocks: httpMocks.createMocks,
  };
}

const version = 'v1.0.38';

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
  // Only add Node.js specific properties if they're available
  ...(mockHttp && { mockHttp }),
  ...(mock && { mock }),
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
export { codi };
