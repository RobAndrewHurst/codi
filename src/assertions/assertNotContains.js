import chalk from 'chalk';

/**
 * Assert that a string does NOT contain a substring, or an array does NOT contain an element.
 * @param {string|Array} haystack - The string or array to search in
 * @param {*} needle - The value that should NOT be present
 * @param {string} [message] - Custom error message
 */
export function assertNotContains(haystack, needle, message) {
  if (typeof haystack === 'string') {
    if (haystack.includes(needle)) {
      throw new Error(
        message ||
          `Expected string to NOT contain ${chalk.bold.yellow(JSON.stringify(needle))}`,
      );
    }
  } else if (Array.isArray(haystack)) {
    if (haystack.includes(needle)) {
      throw new Error(
        message ||
          `Expected array to NOT contain ${chalk.bold.yellow(JSON.stringify(needle))}`,
      );
    }
  } else {
    throw new Error(
      'assertNotContains() expects a string or array as the first argument',
    );
  }
}
