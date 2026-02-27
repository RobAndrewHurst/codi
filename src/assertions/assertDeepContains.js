import chalk from 'chalk';
import { isDeepEqual } from '../util/deepEqual.js';

/**
 * Assert that an object contains all key/value pairs from a subset object.
 * Performs a deep comparison on matching keys.
 * @param {object} obj - The full object
 * @param {object} subset - The expected subset of key/value pairs
 * @param {string} [message] - Custom error message
 */
export function assertDeepContains(obj, subset, message) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error(
      'assertDeepContains() expects an object as the first argument',
    );
  }
  if (typeof subset !== 'object' || subset === null) {
    throw new Error(
      'assertDeepContains() expects an object as the second argument',
    );
  }

  for (const key of Object.keys(subset)) {
    if (!(key in obj)) {
      throw new Error(
        message ||
          `Expected object to contain key ${chalk.bold.yellow(JSON.stringify(key))}`,
      );
    }
    if (!isDeepEqual(obj[key], subset[key])) {
      throw new Error(
        message ||
          `Expected obj.${key} to deeply equal ${chalk.bold.yellow(JSON.stringify(subset[key]))}, but got ${chalk.bold.yellow(JSON.stringify(obj[key]))}`,
      );
    }
  }
}
