import chalk from 'chalk';

/**
 * Assert that a value matches a regular expression.
 * @param {string} value - The string to test
 * @param {RegExp} regex - The regex pattern to match against
 * @param {string} [message] - Custom error message
 */
export function assertMatch(value, regex, message) {
  if (!(regex instanceof RegExp)) {
    throw new Error('assertMatch() expects a RegExp as the second argument');
  }
  if (!regex.test(value)) {
    throw new Error(
      message ||
        `Expected ${chalk.bold.yellow(JSON.stringify(value))} to match ${chalk.bold.yellow(String(regex))}`,
    );
  }
}
