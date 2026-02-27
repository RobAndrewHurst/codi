import chalk from 'chalk';

/**
 * Assert that a string contains a substring, or an array contains an element.
 * @param {string|Array} haystack - The string or array to search in
 * @param {*} needle - The value to search for
 * @param {string} [message] - Custom error message
 */
export function assertContains(haystack, needle, message) {
  if (typeof haystack === 'string') {
    if (!haystack.includes(needle)) {
      throw new Error(
        message ||
          `Expected string to contain ${chalk.bold.yellow(JSON.stringify(needle))}`,
      );
    }
  } else if (Array.isArray(haystack)) {
    if (!haystack.includes(needle)) {
      throw new Error(
        message ||
          `Expected array to contain ${chalk.bold.yellow(JSON.stringify(needle))}`,
      );
    }
  } else {
    throw new Error(
      'assertContains() expects a string or array as the first argument',
    );
  }
}
