import chalk from 'chalk';

/**
 * Assert that a value is an instance of a given constructor.
 * @param {*} value - The value to check
 * @param {Function} Constructor - The expected constructor
 * @param {string} [message] - Custom error message
 */
export function assertInstanceOf(value, Constructor, message) {
  if (typeof Constructor !== 'function') {
    throw new Error(
      'assertInstanceOf() expects a constructor function as the second argument',
    );
  }
  if (!(value instanceof Constructor)) {
    const actualType = value?.constructor?.name || typeof value;
    throw new Error(
      message ||
        `Expected instance of ${chalk.bold.yellow(Constructor.name)}, but got ${chalk.bold.yellow(actualType)}`,
    );
  }
}
