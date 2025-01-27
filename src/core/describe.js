import chalk from 'chalk';
import { state } from '../state/TestState.js';

/**
 * Create a test suite
 * @async
 * @function describe
 * @param {string} name - name of the test suite
 * @param {Function} callback - Suite callback function
 * @returns {Promise<void>}
 */
export async function describe(params, callback) {
  const suite = {
    name: params.name,
    id: params.id,
    parentId: params.parentId,
    startTime: performance.now(),
  };

  const nestedSuite = state.pushSuite(suite);

  const suitePromise = (async () => {
    try {
      await Promise.resolve(callback(suite));
    } catch (error) {
      console.error(chalk.red(`Suite failed: ${nestedSuite.fullPath}`));
      console.error(chalk.red(error.stack));
    } finally {
      nestedSuite.duration = performance.now() - nestedSuite.startTime;
    }
  })();

  state.testTracker.addTest(suitePromise);
  return suitePromise;
}
