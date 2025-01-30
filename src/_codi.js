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

import mockHttp from 'node-mocks-http';

let mockModule;

const browserMock = {
  module: (path, implementation) => {
    console.warn('Mocking not supported in browser environment');
    return implementation;
  },
};

try {
  if (typeof Bun !== 'undefined') {
    const { mock } = await import('bun:test');
    mockModule = mock;
  } else {
    mockModule = browserMock;
  }
} catch {
  mockFunction = browserMock;
}

const version = 'v1.0.24';

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
  mockHttp,
  mock: mockModule,
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
