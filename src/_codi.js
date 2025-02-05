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

import { mock as mockFetch } from 'bun-bagel';
import mockHttp from 'node-mocks-http';

let mock, spyOn;

const browserMock = {
  module: (path, implementation) => {
    console.warn('Mocking not supported in browser environment');
    return implementation;
  },
};

try {
  if (typeof Bun !== 'undefined') {
    ({ mock, spyOn } = await import('bun:test'));
  } else {
    mock = browserMock;
  }
} catch {
  mock = browserMock;
}

const version = 'v1.0.27';

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
  mockFetch,
  mock,
  spyOn,
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
