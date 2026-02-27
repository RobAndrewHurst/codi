import chalk from 'chalk';
import { state } from '../state/TestState.js';

/**
 * Normalize params to an object with name, id, parentId.
 * Supports both explicit-object and implicit-string calling styles.
 *
 *   describe({ name: 'Suite', id: 's1' }, cb)   // explicit
 *   describe('Suite', cb)                         // implicit (auto-id, context stack)
 *
 * @param {object|string} params
 * @returns {object} Normalized { name, id, parentId }
 */
function normalizeParams(params) {
  if (typeof params === 'string') {
    return {
      name: params,
      id: state.generateId(),
      parentId: state.currentContext(),
    };
  }
  return {
    name: params.name,
    id: params.id,
    parentId: params.parentId,
  };
}

/**
 * Create a test suite.
 *
 * Supports two calling styles:
 *   describe({ name, id, parentId? }, callback)   -- explicit
 *   describe('Suite Name', callback)               -- implicit nesting
 *
 * @async
 * @function describe
 * @param {object|string} params - Suite parameters or name string
 * @param {Function} callback - Suite callback function
 * @returns {Promise<void>}
 */
export async function describe(params, callback) {
  if (!params || (typeof params === 'object' && !params.name)) {
    throw new Error('describe() requires a "name" parameter');
  }
  if (typeof params === 'object' && !params.id) {
    throw new Error('describe() requires an "id" parameter');
  }
  if (typeof callback !== 'function') {
    throw new Error('describe() requires a callback function');
  }

  const normalized = normalizeParams(params);

  const suite = {
    ...normalized,
    startTime: performance.now(),
  };

  const nestedSuite = state.pushSuite(suite);

  // Create a hook-registration API passed to the callback.
  const suiteApi = {
    ...suite,
    beforeAll(fn) {
      nestedSuite.beforeAll.push(fn);
    },
    afterAll(fn) {
      nestedSuite.afterAll.push(fn);
    },
    beforeEach(fn) {
      nestedSuite.beforeEach.push(fn);
    },
    afterEach(fn) {
      nestedSuite.afterEach.push(fn);
    },
  };

  const suitePromise = (async () => {
    // Push this suite onto the context stack so nested describe/it
    // calls can find it without explicit parentId
    state.pushContext(suite.id);

    try {
      // Run beforeAll hooks
      for (const hook of nestedSuite.beforeAll) {
        await Promise.resolve(hook());
      }

      await Promise.resolve(callback(suiteApi));

      // Run afterAll hooks
      for (const hook of nestedSuite.afterAll) {
        await Promise.resolve(hook());
      }
    } catch (error) {
      console.error(chalk.red(`Suite failed: ${nestedSuite.name}`));
      console.error(chalk.red(error.stack));
      state.failedTests++;
      state.addTestToSuite(nestedSuite, {
        name: `Suite setup error: ${nestedSuite.name}`,
        status: 'failed',
        error,
        duration: performance.now() - suite.startTime,
      });
    } finally {
      state.popContext();
      nestedSuite.duration = performance.now() - nestedSuite.startTime;
    }
  })();

  state.testTracker.addTest(suitePromise);
  return suitePromise;
}

/**
 * Skip a test suite entirely. The suite and all its tests are recorded as skipped.
 * @async
 * @function describe.skip
 * @param {object|string} params - Suite parameters or name string
 * @param {Function} callback - Suite callback (not executed)
 * @returns {Promise<void>}
 */
describe.skip = async function describeSkip(params, callback) {
  if (
    !params ||
    (typeof params === 'object' && !params.name && typeof params !== 'string')
  ) {
    throw new Error('describe.skip() requires a "name" parameter');
  }

  const normalized =
    typeof params === 'string'
      ? {
          name: params,
          id: state.generateId(),
          parentId: state.currentContext(),
        }
      : { name: params.name, id: params.id, parentId: params.parentId };

  if (typeof params === 'object' && !params.id) {
    throw new Error('describe.skip() requires an "id" parameter');
  }

  const suite = { ...normalized, startTime: performance.now() };
  const nestedSuite = state.pushSuite(suite);
  nestedSuite.skipped = true;
  nestedSuite.duration = 0;

  state.skippedTests++;
  state.addTestToSuite(nestedSuite, {
    name: `(entire suite skipped)`,
    status: 'skipped',
    duration: 0,
  });
};

/**
 * Focus on this suite. When any .only is used, non-only suites/tests are skipped.
 * @async
 * @function describe.only
 * @param {object|string} params - Suite parameters or name string
 * @param {Function} callback - Suite callback function
 * @returns {Promise<void>}
 */
describe.only = async function describeOnly(params, callback) {
  state.hasOnly = true;
  if (typeof params === 'object') {
    params._only = true;
  }
  return describe(params, callback);
};
