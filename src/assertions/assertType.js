import chalk from 'chalk';

/**
 * Assert that a value has the expected typeof.
 * @param {*} value - The value to check
 * @param {string} type - The expected typeof string (e.g. 'string', 'number', 'object')
 * @param {string} [message] - Custom error message
 */
export function assertType(value, type, message) {
  if (typeof value !== type) {
    throw new Error(
      message ||
        `Expected typeof ${chalk.bold.yellow(type)}, but got ${chalk.bold.yellow(typeof value)}`,
    );
  }
}
