import { state } from '../state/TestState.js';

/**
 * Normalize params for it().
 * Supports both explicit-object and implicit-string calling styles.
 *
 *   it({ name: 'test', parentId: 's1' }, cb)   // explicit
 *   it('test', cb)                               // implicit (uses context stack)
 *
 * @param {object|string} params
 * @returns {object} Normalized { name, parentId, timeout? }
 */
function normalizeParams(params) {
  if (typeof params === 'string') {
    const parentId = state.currentContext();
    if (!parentId) {
      throw new Error(
        `it("${params}") was called outside of a describe() block. Use the implicit nesting style by placing it() inside describe().`,
      );
    }
    return { name: params, parentId };
  }
  return {
    name: params.name,
    parentId: params.parentId,
    timeout: params.timeout,
  };
}

/**
 * Create a test case.
 *
 * Supports two calling styles:
 *   it({ name, parentId, timeout? }, callback)  -- explicit
 *   it('test name', callback)                    -- implicit nesting
 *
 * @async
 * @function it
 * @param {object|string} params - Test parameters or name string
 * @param {Function} callback - Test callback function
 * @returns {Promise<void>}
 * @throws {Error} If called outside a describe block
 */
export async function it(params, callback) {
  if (!params || (typeof params === 'object' && !params.name)) {
    throw new Error('it() requires a "name" parameter');
  }
  if (typeof params === 'object' && !params.parentId) {
    throw new Error('it() requires a "parentId" parameter');
  }
  if (typeof callback !== 'function') {
    throw new Error('it() requires a callback function');
  }

  const normalized = normalizeParams(params);
  const suite = state.getSuite(normalized.parentId);

  if (!suite) {
    throw new Error(
      `test: "${normalized.name}" needs to belong to a suite. No suite found with id "${normalized.parentId}"`,
    );
  }

  // If a grep pattern is active, skip tests that don't match
  if (!state.matchesGrep(normalized.name)) {
    state.skippedTests++;
    state.addTestToSuite(suite, {
      name: normalized.name,
      status: 'skipped',
      duration: 0,
    });
    return;
  }

  const test = {
    name: normalized.name,
    startTime: performance.now(),
  };

  // Determine timeout: per-test > suite options > default (5000ms)
  const timeout = normalized.timeout ?? state.options.timeout ?? 5000;

  const testPromise = (async () => {
    try {
      // Run beforeEach hooks (outermost suite first)
      const beforeHooks = state.collectBeforeEach(suite);
      for (const hook of beforeHooks) {
        await Promise.resolve(hook());
      }

      // Race the test callback against a timeout
      await Promise.race([
        Promise.resolve(callback()),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Test timed out after ${timeout}ms`)),
            timeout,
          );
        }),
      ]);

      test.status = 'passed';
      test.duration = performance.now() - test.startTime;
      state.passedTests++;
    } catch (error) {
      test.status = 'failed';
      test.error = error;
      test.duration = performance.now() - test.startTime;
      state.failedTests++;
    } finally {
      // Run afterEach hooks (innermost suite first), even if the test failed
      try {
        const afterHooks = state.collectAfterEach(suite);
        for (const hook of afterHooks) {
          await Promise.resolve(hook());
        }
      } catch (hookError) {
        if (test.status === 'passed') {
          test.status = 'failed';
          test.error = hookError;
          state.passedTests--;
          state.failedTests++;
        }
      }
      state.addTestToSuite(suite, test);
    }
  })();

  state.testTracker.addTest(testPromise);
  return testPromise;
}

/**
 * Skip a test case. Recorded as skipped without executing.
 * @async
 * @function it.skip
 * @param {object|string} params - Test parameters or name string
 * @param {Function} callback - Test callback (not executed)
 * @returns {Promise<void>}
 */
it.skip = async function itSkip(params, callback) {
  if (
    !params ||
    (typeof params === 'object' && !params.name && typeof params !== 'string')
  ) {
    throw new Error('it.skip() requires a "name" parameter');
  }

  const normalized =
    typeof params === 'string'
      ? { name: params, parentId: state.currentContext() }
      : { name: params.name, parentId: params.parentId };

  if (!normalized.parentId) {
    throw new Error(
      'it.skip() requires a "parentId" parameter or must be inside a describe() block',
    );
  }

  const suite = state.getSuite(normalized.parentId);
  if (!suite) {
    throw new Error(
      `test: "${normalized.name}" needs to belong to a suite. No suite found with id "${normalized.parentId}"`,
    );
  }

  state.skippedTests++;
  state.addTestToSuite(suite, {
    name: normalized.name,
    status: 'skipped',
    duration: 0,
  });
};

/**
 * Focus on this test. When any .only is used, non-only tests are skipped.
 * @async
 * @function it.only
 * @param {object|string} params - Test parameters or name string
 * @param {Function} callback - Test callback function
 * @returns {Promise<void>}
 */
it.only = async function itOnly(params, callback) {
  state.hasOnly = true;
  if (typeof params === 'object') {
    params._only = true;
  }
  return it(params, callback);
};
