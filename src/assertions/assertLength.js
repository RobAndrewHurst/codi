import chalk from 'chalk';

/**
 * Assert that an array or string has the expected length.
 * @param {Array|string} value - The array or string to check
 * @param {number} length - The expected length
 * @param {string} [message] - Custom error message
 */
export function assertLength(value, length, message) {
  if (value == null || typeof value.length !== 'number') {
    throw new Error(
      'assertLength() expects an array or string as the first argument',
    );
  }
  if (value.length !== length) {
    throw new Error(
      message ||
        `Expected length ${chalk.bold.yellow(length)}, but got ${chalk.bold.yellow(value.length)}`,
    );
  }
}
